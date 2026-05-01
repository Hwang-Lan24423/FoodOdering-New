<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\ChatbotQuery;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $userMessage = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['message' => 'API Key chưa được cấu hình'], 500);
        }

        // 1. Lay danh sach thuc don
        $menuInfo = "";
        $milkTeaCount = 0;
        $cakeCount = 0;
        try {
            $products = Product::all(['name', 'price', 'image', 'code']);
            foreach ($products as $p) {
                $isMilkTea = str_starts_with($p->code, 'M');
                if ($isMilkTea) $milkTeaCount++; else $cakeCount++;
                
                $imageUrl = str_starts_with($p->image, 'http') ? $p->image : "http://localhost:8000/" . $p->image;
                $menuInfo .= "- Tên: {$p->name} | Giá: " . number_format($p->price) . "đ | Link ảnh: " . $imageUrl . "\n";
            }
            $menuInfo = "Tổng cộng quán có {$milkTeaCount} món trà sữa và {$cakeCount} món bánh.\n" . $menuInfo;
        } catch (\Exception $e) {
            $menuInfo .= "(Hiện tại chưa có dữ liệu thực đơn cụ thể)";
        }

        // 2. Thiet lap System Prompt (Thong minh hon)
        $systemPrompt = "Bạn là trợ lý ảo thân thiện của 'Bake n Take'. 
        
        Quy tắc trả lời:
        1. Nếu khách chào hỏi hoặc hỏi bạn là ai: Hãy trả lời lịch sự, tự giới thiệu mình là trợ lý của Bake n Take. CHƯA CẦN liệt kê món ăn trừ khi khách yêu cầu.
        2. Nếu khách hỏi về món ăn, gợi ý món hoặc thực đơn: 
           - Hãy chọn ra 3-5 món phù hợp nhất.
           - Với mỗi món, trình bày: **Tên món** - Giá: [Giá]đ.
           - Ngay sau đó chèn ảnh: ![ảnh](Link ảnh)
        3. Luôn trả lời đầy đủ, thân thiện và bằng tiếng Việt.

        Thực đơn quán bạn có:
        $menuInfo";

        try {
            // Su dung mo hinh Flash moi nhat
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemPrompt . "\n\nKhách hàng hỏi: " . $userMessage]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.8,
                    'maxOutputTokens' => 2000, // Tang toi da de khong bi ngat loi
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $botReply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Xin lỗi, mình chưa hiểu ý bạn.';

                // 4. Luu vao database de theo doi
                try {
                    ChatbotQuery::create([
                        'queries' => $userMessage,
                        'replies' => $botReply
                    ]);
                } catch (\Exception $dbEx) {
                    Log::error("Chatbot save error: " . $dbEx->getMessage());
                }

                return response()->json(['reply' => $botReply]);
            }

            Log::error('Gemini API Error: ' . $response->body());
            return response()->json(['message' => 'Lỗi kết nối với trí tuệ nhân tạo'], 500);

        } catch (\Exception $e) {
            Log::error('Chatbot Exception: ' . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra'], 500);
        }
    }
}
