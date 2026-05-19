<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ubah tabel users (HANYA tambah shop_id, karena email sudah unik dari sananya)
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('shop_id')->nullable()->after('role');
        });

        // 2. Tambahkan shop_id ke semua tabel data untuk sistem Multi-Tenant
        Schema::table('menus', function (Blueprint $table) {
            $table->unsignedBigInteger('shop_id')->nullable();
        });
        Schema::table('ingredients', function (Blueprint $table) {
            $table->unsignedBigInteger('shop_id')->nullable();
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('shop_id')->nullable();
        });
        Schema::table('settings', function (Blueprint $table) {
            $table->unsignedBigInteger('shop_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
