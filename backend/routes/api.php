<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [AuthController::class, 'resend'])
    ->middleware(['throttle:6,1'])
    ->name('verification.send');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CouponController;
use App\Http\Controllers\API\TicketController;
use App\Http\Controllers\API\ChatbotController;
use App\Http\Controllers\API\SePayController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\AdminUserController;
use App\Http\Controllers\API\LoyaltyController;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'getByProduct']);

// SePay Webhook
Route::post('/sepay-webhook', [SePayController::class, 'webhook']);

// Chatbot Gemini
Route::post('/chat', [App\Http\Controllers\API\ChatbotController::class, 'chat']);


// Public support/chatbot
Route::post('/tickets', [TicketController::class, 'store']);
Route::post('/chatbot', [ChatbotController::class, 'chat']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    
    // Admin & Staff protected routes
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Dashboard Overview
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

    // Order routes
    Route::get('/orders/pending-count', [OrderController::class, 'getPendingCount']);
    // Coupons Management
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{id}', [CouponController::class, 'update']);
    Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);
    Route::get('/coupons/active', [CouponController::class, 'getActiveCoupons']);
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    Route::get('/orders/dashboard-stats', [OrderController::class, 'dashboardStats']);
    Route::get('/orders/stats', [OrderController::class, 'stats']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Ticket management
    Route::get('/tickets/pending-count', [TicketController::class, 'getPendingCount']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::patch('/tickets/{id}/status', [TicketController::class, 'updateStatus']);

    // Review submission
    Route::post('/reviews', [ReviewController::class, 'store']);


    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications', [\App\Http\Controllers\API\NotificationController::class, 'deleteAll']);

    // Admin User Management
    Route::prefix('admin')->group(function () {
        Route::get('users', [AdminUserController::class, 'index']);
        Route::post('users', [AdminUserController::class, 'store']);
        Route::put('users/{id}', [AdminUserController::class, 'update']);
        Route::delete('users/{id}', [AdminUserController::class, 'destroy']);
    });

    // Loyalty Points
    Route::get('/loyalty/status', [LoyaltyController::class, 'getStatus']);
    Route::get('/loyalty/history', [LoyaltyController::class, 'getHistory']);
});
