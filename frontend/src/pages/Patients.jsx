import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form, Badge, Card } from 'react-bootstrap';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Charger les patients avec les relations user
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:8000/api/patients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Gérer différentes structures de réponse
      let patientsData = [];
      
      if (responseData.data && Array.isArray(responseData.data)) {
        patientsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        patientsData = responseData;
      } else if (typeof responseData === 'object') {
        patientsData = [responseData];
      }
      
      setPatients(patientsData);
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement des patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour extraire les données de manière sécurisée
  const getPatientDisplayData = (patient) => {
    if (!patient) return {};
    
    // Si le patient a une relation user (données imbriquées)
    if (patient.user) {
      return {
        id_patient: patient.id_patient,
        CIN: patient.CIN,
        nom: patient.user.nom,
        prenom: patient.user.prenom,
        email: patient.user.email,
        date_naissance: patient.user.date_naissance,
        num_tel: patient.user.num_tel,
        adresse: patient.user.adresse,
        etat: patient.user.etat,
        gender: patient.gender,
        poids: patient.poids,
        height: patient.height,
        id_rec: patient.id_rec
      };
    }
    
    // Si les données sont plates mais avec les champs user
    if (patient.nom) {
      return {
        id_patient: patient.id_patient,
        CIN: patient.CIN,
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
        date_naissance: patient.date_naissance,
        num_tel: patient.num_tel,
        adresse: patient.adresse,
        etat: patient.etat,
        gender: patient.gender,
        poids: patient.poids,
        height: patient.height,
        id_rec: patient.id_rec
      };
    }

    // Si seulement les données patient sont disponibles
    return {
      id_patient: patient.id_patient,
      CIN: patient.CIN,
      nom: 'Données manquantes',
      prenom: '',
      email: 'N/A',
      date_naissance: null,
      num_tel: 'N/A',
      adresse: 'N/A',
      etat: patient.etat || 'actif',
      gender: patient.gender,
      poids: patient.poids,
      height: patient.height,
      id_rec: patient.id_rec
    };
  };

  // Supprimer un patient
  const handleDeletePatient = async (id_patient) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/patients/${id_patient}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setPatients(patients.filter(patient => patient.id_patient !== id_patient));
          alert('Patient supprimé avec succès');
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  // Activer/désactiver un patient
  const handleTogglePatientState = async (CIN) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/${CIN}/state`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        loadPatients();
        alert('État patient modifié avec succès');
      } else {
        alert('Erreur lors de la modification de l\'état');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  // Fonctions utilitaires
  const getGenderText = (gender) => {
    if (!gender) return 'Non spécifié';
    return gender === 'M' ? 'Masculin' : 'Féminin';
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateNaissance);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  // Fonction sécurisée pour obtenir les valeurs
  const getSafeValue = (obj, key, defaultValue = 'N/A') => {
    return obj && obj[key] !== null && obj[key] !== undefined ? obj[key] : defaultValue;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des patients...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>Gestion des Patients</h1>
        <p className="text-muted">Liste de tous les patients du système</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" size="sm" onClick={loadPatients}>
            Réessayer
          </Button>
        </Alert>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Liste des Patients
          </h5>
          <Badge bg="primary" className="fs-6">
            {patients.length} patient(s)
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {patients.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-user-injured fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun patient trouvé</h5>
              <p className="text-muted">
                {error ? 'Erreur de chargement des données' : 'Aucun patient enregistré dans le système'}
              </p>
              {error && (
                <Button variant="primary" onClick={loadPatients}>
                  Réessayer le chargement
                </Button>
              )}
            </div>
          ) : (
            <Table striped bordered hover responsive className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>CIN</th>
                  <th>Nom Complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Âge</th>
                  <th>Genre</th>
                  <th>Poids/Taille</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const patientData = getPatientDisplayData(patient);
                  
                  return (
                    <tr key={patientData.id_patient || patientData.CIN}>
                      <td>{getSafeValue(patientData, 'CIN')}</td>
                      <td>
                        <strong>
                          {getSafeValue(patientData, 'nom', '')} {getSafeValue(patientData, 'prenom', '')}
                        </strong>
                      </td>
                      <td>{getSafeValue(patientData, 'email')}</td>
                      <td>{getSafeValue(patientData, 'num_tel', 'Non renseigné')}</td>
                      <td>{calculateAge(getSafeValue(patientData, 'date_naissance'))} ans</td>
                      <td>
                        <Badge bg={getSafeValue(patientData, 'gender') === 'M' ? 'primary' : 'success'}>
                          {getGenderText(getSafeValue(patientData, 'gender'))}
                        </Badge>
                      </td>
                      <td>
                        {getSafeValue(patientData, 'poids') && `${getSafeValue(patientData, 'poids')}kg`}
                        {getSafeValue(patientData, 'poids') && getSafeValue(patientData, 'height') && ' / '}
                        {getSafeValue(patientData, 'height') && `${getSafeValue(patientData, 'height')}cm`}
                        {!getSafeValue(patientData, 'poids') && !getSafeValue(patientData, 'height') && '-'}
                      </td>
                      <td>
                        <Badge bg={getSafeValue(patientData, 'etat') === 'actif' ? 'success' : 'warning'}>
                          {getSafeValue(patientData, 'etat', 'actif')}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patientData);
                              setShowModal(true);
                            }}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant={getSafeValue(patientData, 'etat') === 'actif' ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleTogglePatientState(getSafeValue(patientData, 'CIN'))}
                            title={getSafeValue(patientData, 'etat') === 'actif' ? 'Désactiver' : 'Activer'}
                          >
                            <i className="fas fa-power-off"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePatient(getSafeValue(patientData, 'id_patient'))}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal pour modifier un patient */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setSelectedPatient(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-edit me-2"></i>
            Modifier le patient
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>CIN</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="CIN"
                    value={getSafeValue(selectedPatient, 'CIN', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select 
                    value={getSafeValue(selectedPatient, 'gender', '')}
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom"
                    value={getSafeValue(selectedPatient, 'nom', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Prénom"
                    value={getSafeValue(selectedPatient, 'prenom', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={getSafeValue(selectedPatient, 'email', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    value={getSafeValue(selectedPatient, 'date_naissance', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Téléphone"
                    value={getSafeValue(selectedPatient, 'num_tel', '')}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Réceptionniste ID</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="ID du réceptionniste"
                    defaultValue={getSafeValue(selectedPatient, 'id_rec', '')}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Poids (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="Poids"
                    defaultValue={getSafeValue(selectedPatient, 'poids', '')}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Taille (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="Taille"
                    defaultValue={getSafeValue(selectedPatient, 'height', '')}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Adresse"
                value={getSafeValue(selectedPatient, 'adresse', '')}
                readOnly
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Patients;