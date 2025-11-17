<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecins extends Model
{
    protected $primaryKey = 'id_medecin';

    protected $fillable = [
        'CIN',
        'annee_travail',
        'description',
        'specialite',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }
}
