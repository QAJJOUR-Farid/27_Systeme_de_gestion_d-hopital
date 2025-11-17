<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'CIN',
        'gender',
        'poids',
        'height',
        'id_rec'
    ];

    protected $primaryKey = 'id_patient';

    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }
}
