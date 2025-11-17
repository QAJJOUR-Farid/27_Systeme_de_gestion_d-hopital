<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id('id_patient');
            $table->string('CIN', 20)->unique();
            $table->enum('gender', ['M', 'F']);
            $table->decimal('poids', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();

            // Link to receptionniste
            $table->unsignedBigInteger('id_rec')->nullable();
            $table->foreign('id_rec')
                    ->references('id_rec')
                    ->on('receptionnistes')
                    ->onDelete('set null');

            // Link to user
            $table->foreign('CIN')
                    ->references('CIN')
                    ->on('users')
                    ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
