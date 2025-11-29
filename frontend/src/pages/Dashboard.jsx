import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);

  // Fonction pour récupérer les données
  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Charger les statistiques selon le rôle
  useEffect(() => {
    const loadStats = async () => {
      let statsData = [];

      switch (user?.role) {
        case 'admin':
          const [users, patients, diagnostics, produits] = await Promise.all([
            fetchData('http://localhost:8000/api/users'),
            fetchData('http://localhost:8000/api/patients'),
            fetchData('http://localhost:8000/api/diagnostics/index'),
            fetchData('http://localhost:8000/api/produit/index')
          ]);

          statsData = [
            { 
              title: 'Utilisateurs', 
              value: users?.length || '0', 
              icon: 'fas fa-users', 
              color: 'primary' 
            },
            { 
              title: 'Patients', 
              value: patients?.length || '0', 
              icon: 'fas fa-user-injured', 
              color: 'danger' 
            },
            { 
              title: 'Diagnostics', 
              value: diagnostics?.length || '0', 
              icon: 'fas fa-stethoscope', 
              color: 'warning' 
            },
            { 
              title: 'Produits en Stock', 
              value: produits?.length || '0', 
              icon: 'fas fa-pills', 
              color: 'info' 
            }
          ];
          break;
        
        case 'medecin':
          const [rdvMedecin, patientsMedecin] = await Promise.all([
            fetchData('http://localhost:8000/api/rendezVous/index'),
            fetchData('http://localhost:8000/api/patients')
          ]);

          statsData = [
            { 
              title: 'Rendez-vous Aujourd\'hui', 
              value: '8', 
              icon: 'fas fa-calendar-day', 
              color: 'primary' 
            },
            { 
              title: 'Patients Suivis', 
              value: patientsMedecin?.length || '45', 
              icon: 'fas fa-user-injured', 
              color: 'success' 
            },
            { 
              title: 'Diagnostics Ce Mois', 
              value: '23', 
              icon: 'fas fa-stethoscope', 
              color: 'info' 
            },
            { 
              title: 'Urgences', 
              value: '2', 
              icon: 'fas fa-exclamation-triangle', 
              color: 'warning' 
            }
          ];
          break;
        
        case 'infirmier':
          const [diagnosticsInfirmier] = await Promise.all([
            fetchData('http://localhost:8000/api/diagnostics/index'),
            fetchData('http://localhost:8000/api/rendezVous/index')
          ]);

          statsData = [
            { 
              title: 'Soins Aujourd\'hui', 
              value: '9', 
              icon: 'fas fa-hand-holding-medical', 
              color: 'primary' 
            },
            { 
              title: 'Patients à Suivre', 
              value: '5', 
              icon: 'fas fa-user-injured', 
              color: 'success' 
            },
            { 
              title: 'Traitements', 
              value: diagnosticsInfirmier?.length || '13', 
              icon: 'fas fa-pills', 
              color: 'info' 
            },
            { 
              title: 'Alertes', 
              value: '7', 
              icon: 'fas fa-bell', 
              color: 'warning' 
            }
          ];
          break;
        
        case 'receptionniste':
          const [rdvReception, patientsReception] = await Promise.all([
            fetchData('http://localhost:8000/api/rendezVous/index'),
            fetchData('http://localhost:8000/api/patients')
          ]);

          statsData = [
            { 
              title: 'RDV Aujourd\'hui', 
              value: rdvReception?.length || '25', 
              icon: 'fas fa-calendar-day', 
              color: 'primary' 
            },
            { 
              title: 'Nouveaux Patients', 
              value: '5', 
              icon: 'fas fa-user-plus', 
              color: 'success' 
            },
            { 
              title: 'RDV en Attente', 
              value: '8', 
              icon: 'fas fa-clock', 
              color: 'info' 
            },
            { 
              title: 'Appels', 
              value: '34', 
              icon: 'fas fa-phone', 
              color: 'warning' 
            }
          ];
          break;
        
        case 'magasinier':
          const [produitsStock, signalements] = await Promise.all([
            fetchData('http://localhost:8000/api/produit/index'),
            fetchData('http://localhost:8000/api/signalIncident/index')
          ]);

          statsData = [
            { 
              title: 'Produits en Stock', 
              value: produitsStock?.length || '1,234', 
              icon: 'fas fa-pills', 
              color: 'primary' 
            },
            { 
              title: 'Stock Faible', 
              value: '12', 
              icon: 'fas fa-exclamation-triangle', 
              color: 'warning' 
            },
            { 
              title: 'Commandes en Cours', 
              value: '5', 
              icon: 'fas fa-truck', 
              color: 'info' 
            },
            { 
              title: 'Ruptures', 
              value: signalements?.filter(s => s.type === 'rupture')?.length || '2', 
              icon: 'fas fa-times-circle', 
              color: 'danger' 
            }
          ];
          break;
        
        case 'patient':
          const [diagnosticsPatient] = await Promise.all([
            fetchData(`http://localhost:8000/api/diagnostics/${user.id}/patient`)
          ]);

          statsData = [
            { 
              title: 'Prochain RDV', 
              value: 'Demain', 
              icon: 'fas fa-calendar-check', 
              color: 'primary' 
            },
            { 
              title: 'Ordonnances', 
              value: '3', 
              icon: 'fas fa-prescription', 
              color: 'success' 
            },
            { 
              title: 'Diagnostics', 
              value: diagnosticsPatient?.length || '2', 
              icon: 'fas fa-file-medical', 
              color: 'info' 
            },
            { 
              title: 'Messages', 
              value: '1', 
              icon: 'fas fa-envelope', 
              color: 'warning' 
            }
          ];
          break;
        
        default:
          statsData = [];
      }

      setStats(statsData);
    };

    loadStats();
  }, [user]);

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