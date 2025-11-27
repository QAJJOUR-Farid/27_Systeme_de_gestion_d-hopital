import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  // Statistiques par rôle
  const getStatsByRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Utilisateurs', value: '150', icon: 'fas fa-users', color: 'primary' },
          { title: 'Rendez-vous', value: '45', icon: 'fas fa-calendar-check', color: 'success' },
          { title: 'Produits en Stock', value: '1,234', icon: 'fas fa-pills', color: 'info' },
          { title: 'Diagnostics', value: '89', icon: 'fas fa-stethoscope', color: 'warning' }
        ];
      
      case 'medecin':
        return [
          { title: 'Rendez-vous Aujourd\'hui', value: '8', icon: 'fas fa-calendar-day', color: 'primary' },
          { title: 'Patients Suivis', value: '45', icon: 'fas fa-user-injured', color: 'success' },
          { title: 'Diagnostics Ce Mois', value: '23', icon: 'fas fa-stethoscope', color: 'info' },
          { title: 'Urgences', value: '2', icon: 'fas fa-exclamation-triangle', color: 'warning' }
        ];
      
      case 'infirmier':
        return [
          { title: 'Soins Aujourd\'hui', value: '12', icon: 'fas fa-hand-holding-medical', color: 'primary' },
          { title: 'Patients à Suivre', value: '6', icon: 'fas fa-user-injured', color: 'success' },
          { title: 'Traitements', value: '18', icon: 'fas fa-pills', color: 'info' },
          { title: 'Alertes', value: '3', icon: 'fas fa-bell', color: 'warning' }
        ];
      
      case 'receptionniste':
        return [
          { title: 'RDV Aujourd\'hui', value: '25', icon: 'fas fa-calendar-day', color: 'primary' },
          { title: 'Nouveaux Patients', value: '5', icon: 'fas fa-user-plus', color: 'success' },
          { title: 'RDV en Attente', value: '8', icon: 'fas fa-clock', color: 'info' },
          { title: 'Appels', value: '34', icon: 'fas fa-phone', color: 'warning' }
        ];
      
      case 'magasinier':
        return [
          { title: 'Produits en Stock', value: '1,234', icon: 'fas fa-pills', color: 'primary' },
          { title: 'Stock Faible', value: '12', icon: 'fas fa-exclamation-triangle', color: 'warning' },
          { title: 'Commandes en Cours', value: '5', icon: 'fas fa-truck', color: 'info' },
          { title: 'Rupertures', value: '2', icon: 'fas fa-times-circle', color: 'danger' }
        ];
      
      case 'patient':
        return [
          { title: 'Prochain RDV', value: 'Demain', icon: 'fas fa-calendar-check', color: 'primary' },
          { title: 'Ordonnances', value: '3', icon: 'fas fa-prescription', color: 'success' },
          { title: 'Diagnostics', value: '2', icon: 'fas fa-file-medical', color: 'info' },
          { title: 'Messages', value: '1', icon: 'fas fa-envelope', color: 'warning' }
        ];
      
      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin': return 'Tableau de Bord Administratif';
      case 'medecin': return 'Espace Médical';
      case 'infirmier': return 'Espace Soins Infirmiers';
      case 'receptionniste': return 'Espace Accueil';
      case 'magasinier': return 'Espace Gestion Stock';
      case 'patient': return 'Mon Espace Patient';
      default: return 'Tableau de Bord';
    }
  };

  const stats = getStatsByRole();

  return (
    <Container>
      <div className="mb-4">
        <h1>{getWelcomeMessage()}</h1>
        <p className="text-muted">
          Bienvenue {user?.prenom} {user?.nom} • {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col md={3} key={index} className="mb-3">
            <Card className={`stats-card modern-card border-${stat.color}`}>
              <Card.Body className="text-center">
                <div className={`stats-icon text-${stat.color}`}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stats-number">{stat.value}</div>
                <div className="stats-label">{stat.title}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8}>
          <Card className="modern-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Activité Récente
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Bienvenue dans votre espace personnalisé {user?.role}.</p>
              <p>Utilisez le menu de navigation pour accéder aux fonctionnalités spécifiques à votre rôle.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="modern-card">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Notifications
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Aucune notification pour le moment.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;