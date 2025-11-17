<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('receptionnistes', function (Blueprint $table) {
            $table->id('id_rec');
            $table->string('CIN', 20)->unique();
            $table->foreign('CIN')->references('CIN')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('receptionnistes');
    }
};

