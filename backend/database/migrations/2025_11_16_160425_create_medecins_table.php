<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('medecins', function (Blueprint $table) {
            $table->id('id_medecin');
            $table->string('CIN', 20)->unique();
            $table->year('annee_travail');
            $table->text('description')->nullable();
            $table->string('specialite', 100);
            $table->foreign('CIN')->references('CIN')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('medecins');
    }
};

