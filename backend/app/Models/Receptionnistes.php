<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receptionnistes extends Model
{
    protected $fillable = [
        'CIN'
    ];
    protected $primaryKey = 'id_rec';

    public function user()
    {
        return $this->belongsTo(User::class, 'CIN', 'CIN');
    }
}

