<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chatbot_queries', function (Blueprint $table) {
            $table->text('queries')->change();
            $table->text('replies')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chatbot_queries', function (Blueprint $table) {
            $table->string('queries')->change();
            $table->string('replies')->change();
        });
    }
};
