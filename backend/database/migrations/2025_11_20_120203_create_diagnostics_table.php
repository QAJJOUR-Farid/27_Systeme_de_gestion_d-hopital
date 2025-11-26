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
        Schema::create('diagnostics', function (Blueprint $table) {
            $table->id('idD');
            $table->date('dateD')->nullable();
            $table->text('description')->nullable();
            $table->text('resultats')->nullable();
            $table->enum('etat', ['approuver', 'enAttente'])->default('enAttente');
            $table->unsignedBigInteger('id_medecin')->nullable();
            $table->unsignedBigInteger('id_patient');
            $table->unsignedBigInteger(('id_infirmier'))->nullable();

            $table->foreign('id_infirmier')->references('id_infirmier')->on('infirmiers')->onDelete('set null');
            $table->foreign('id_patient')->references('id_patient')->on('patients')->onDelete('cascade');
            $table->foreign('id_medecin')->references('id_medecin')->on('medecins')->onDelete('set null');

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostics');
    }
};
