<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('menus', function (Blueprint $table) {
            $table->decimal('hpp', 15, 2)->default(0); 
        });
    }

    public function down() {
        Schema::table('menus', function ($table) { 
            $table->dropColumn('hpp'); 
        });
    }
};