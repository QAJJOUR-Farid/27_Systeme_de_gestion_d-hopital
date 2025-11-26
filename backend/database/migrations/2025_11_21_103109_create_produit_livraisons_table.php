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
        Schema::create('produit_livraisons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("idP");
            $table->unsignedBigInteger("idL");
            $table->integer('quantite');

            $table->foreign('idP')->references('idP')->on('produits')->onDelete('cascade');
            $table->foreign('idL')->references('id')->on('livraisons')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::dropIfExists('produit_livraisons');
    }
};
