<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Ticket;

class TicketController extends Controller
{
    public function index()
    {
        return response()->json(Ticket::latest()->get());
    }

    public function getPendingCount()
    {
        $count = Ticket::whereIn('status', ['Open', 'Pending'])->count();
        return response()->json(['count' => $count]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string',
            'fullname' => 'required|string',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        $data = $request->all();
        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
        }

        $ticket = Ticket::create($data);
        return response()->json($ticket, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['status' => $request->status]);

        // Gửi thông báo nếu có user_id
        if ($ticket->user_id) {
            \App\Models\Notification::send(
                $ticket->user_id,
                'Yêu cầu hỗ trợ đã cập nhật',
                'Yêu cầu "' . $ticket->subject . '" đã được chuyển sang trạng thái: ' . $request->status,
                'support',
                '/support'
            );
        }

        return response()->json($ticket);
    }
}
