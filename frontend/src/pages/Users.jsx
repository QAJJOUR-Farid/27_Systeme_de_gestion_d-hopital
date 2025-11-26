import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function Users() {
  const users = [
    { id: 1, nom: "Ali", prenom: "Ben", email: "ali@example.com" },
    { id: 2, nom: "Sara", prenom: "Ouahbi", email: "sara@example.com" },
  ];

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Liste des utilisateurs</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
