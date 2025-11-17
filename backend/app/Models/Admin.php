<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    //
    protected $primaryKey = 'id';
    protected $fillable = [
        'CIN'
    ];

    public function user(){
        return $this->belongsTo(User::class,'CIN','CIN');
    }

}
