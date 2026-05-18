<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Tambahkan kolom user_id ke 4 tabel utama kita
        Schema::table('menus', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
        });
        Schema::table('ingredients', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
        });
        Schema::table('settings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) { $table->dropForeign(['user_id']); $table->dropColumn('user_id'); });
        Schema::table('ingredients', function (Blueprint $table) { $table->dropForeign(['user_id']); $table->dropColumn('user_id'); });
        Schema::table('orders', function (Blueprint $table) { $table->dropForeign(['user_id']); $table->dropColumn('user_id'); });
        Schema::table('settings', function (Blueprint $table) { $table->dropForeign(['user_id']); $table->dropColumn('user_id'); });
    }
};