import React from "react";

function Dashboard() {
  const stats = [
    { name: "Users", value: 120, color: "#0d6efd" },
    { name: "Rendez-vous", value: 50, color: "#198754" },
    { name: "Produits", value: 80, color: "#ffc107" },
    { name: "Incidents", value: 5, color: "#dc3545" },
  ];

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3">
        {stats.map(stat => (
          <div className="col-md-3" key={stat.name}>
            <div className="card text-white mb-3" style={{ backgroundColor: stat.color }}>
              <div className="card-body">
                <h5 className="card-title">{stat.name}</h5>
                <p className="card-text fs-4">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
