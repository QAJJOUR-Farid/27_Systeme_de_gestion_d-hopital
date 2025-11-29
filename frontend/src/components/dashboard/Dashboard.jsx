// import React from 'react';
// import { Container, Row, Col, Card } from 'react-bootstrap';
// import { useAuth } from '../hooks/useAuth';

// const Dashboard = () => {
//   const { user } = useAuth();

//   const getStatsByRole = () => {
//     switch (user?.role) {
//       case 'admin':
//         return [
//           { title: 'Utilisateurs', value: '0', icon: 'fas fa-users', color: 'primary' },
//           { title: 'Rendez-vous', value: '0', icon: 'fas fa-calendar-check', color: 'success' },
//           { title: 'Produits en Stock', value: '0', icon: 'fas fa-pills', color: 'info' },
//           { title: 'Diagnostics', value: '0', icon: 'fas fa-stethoscope', color: 'warning' }
//         ];
      
//       case 'medecin':
//         return [
//           { title: 'Rendez-vous Aujourd\'hui', value: '8', icon: 'fas fa-calendar-day', color: 'primary' },
//           { title: 'Patients Suivis', value: '45', icon: 'fas fa-user-injured', color: 'success' },
//           { title: 'Diagnostics Ce Mois', value: '23', icon: 'fas fa-stethoscope', color: 'info' }
//         ];
      
//       case 'patient':
//         return [
//           { title: 'Prochain RDV', value: 'Demain', icon: 'fas fa-calendar-check', color: 'primary' },
//           { title: 'Ordonnances', value: '3', icon: 'fas fa-prescription', color: 'success' }
//         ];
      
//       default:
//         return [
//           { title: 'Tableau de Bord', value: 'Bienvenue', icon: 'fas fa-chart-line', color: 'primary' }
//         ];
//     }
//   };

//   const stats = getStatsByRole();

//   return (
//     <Container>
//       <div className="mb-4">
//         <h1>Tableau de Bord</h1>
//         <p className="text-muted">
//           Bienvenue {user?.prenom} {user?.nom}
//         </p>
//       </div>
      
//       <Row className="mb-4">
//         {stats.map((stat, index) => (
//           <Col md={3} key={index} className="mb-3">
//             <Card className={`stats-card modern-card border-${stat.color}`}>
//               <Card.Body className="text-center">
//                 <div className={`stats-icon text-${stat.color}`}>
//                   <i className={stat.icon}></i>
//                 </div>
//                 <div className="stats-number">{stat.value}</div>
//                 <div className="stats-label">{stat.title}</div>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <Row>
//         <Col md={8}>
//           <Card className="modern-card">
//             <Card.Header>
//               <h5 className="mb-0">
//                 <i className="fas fa-chart-line me-2"></i>
//                 Activité Récente
//               </h5>
//             </Card.Header>
//             <Card.Body>
//               <p>Bienvenue dans votre espace {user?.role}.</p>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default Dashboard;