<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('infirmiers', function (Blueprint $table) {
            $table->id('id_infirmier');
            $table->string('CIN', 20)->unique();
            $table->string('service', 100);

            $table->unsignedBigInteger('id_medecin')->nullable();
            $table->foreign('id_medecin')->references('id_medecin')->on('medecins')->onDelete('set null');

            $table->foreign('CIN')->references('CIN')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('infirmiers');
    }
};
