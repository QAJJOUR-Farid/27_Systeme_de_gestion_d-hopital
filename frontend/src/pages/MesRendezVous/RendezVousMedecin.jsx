import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { rendezVousAPI, userAPI, patientsAPI } from '../../Services/api';

const RendezVousReceptionniste = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [filteredRendezVous, setFilteredRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    date: '',
    search: ''
  });

  // États pour le formulaire
  const [formData, setFormData] = useState({
    id_patient: '',
    id_medecin: '',
    date_rv: '',
    heure_rv: '09:00:00',
    motif: ''
  });

  // États pour les listes de sélection
  const [medecins, setMedecins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rendezVous, filters, patients, medecins]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      await Promise.all([
        loadRendezVous(),
        loadMedecins(),
        loadPatients()
      ]);
    } catch (err) {
      console.error('Erreur chargement initial:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoadingData(false);
    }
  };

  const loadRendezVous = async () => {
    try {
      setLoading(true);
      const response = await rendezVousAPI.getRendezVous();
      console.log('Rendez-vous chargés:', response.data);
      
      // Gestion flexible de la structure de réponse
      let rendezVousData = [];
      if (Array.isArray(response.data)) {
        rendezVousData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        rendezVousData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        rendezVousData = response.data.data;
      }
      
      setRendezVous(rendezVousData);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger la liste des médecins depuis l'API
  const loadMedecins = async () => {
    try {
      console.log('🔄 Chargement des médecins...');
      const response = await userAPI.getAllMedecins();
      console.log('📋 Réponse médecins:', response);
      console.log('📋 Données médecins:', response.data);
      
      // Gestion flexible de la structure de réponse
      let medecinsData = [];
      if (Array.isArray(response.data)) {
        medecinsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        medecinsData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        medecinsData = response.data.data;
      }
      
      console.log(`✅ ${medecinsData.length} médecins chargés:`, medecinsData);
      setMedecins(medecinsData);
    } catch (err) {
      console.error('❌ Erreur chargement médecins:', err);
      console.error('Détails erreur:', err.response?.data);
      setError('Erreur lors du chargement des médecins: ' + (err.response?.data?.message || err.message));
    }
  };

  // Charger la liste des patients depuis l'API
  const loadPatients = async () => {
    try {
      console.log('🔄 Chargement des patients...');
      const response = await patientsAPI.getAllPatients(); // ✅ CORRECT - patientsAPI
      console.log('📋 Réponse patients:', response);
      console.log('📋 Données patients:', response.data);
      
      // Gestion flexible de la structure de réponse
      let patientsData = [];
      if (Array.isArray(response.data)) {
        patientsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        patientsData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        patientsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.patients)) {
        patientsData = response.data.patients;
      }
      
      console.log(`✅ ${patientsData.length} patients chargés:`, patientsData);
      setPatients(patientsData);
    } catch (err) {
      console.error('❌ Erreur chargement patients:', err);
      console.error('Détails erreur:', err.response?.data);
      setError('Erreur lors du chargement des patients: ' + (err.response?.data?.message || err.message));
    }
  };

  const applyFilters = () => {
    let filtered = [...rendezVous];

    if (filters.statut) {
      filtered = filtered.filter(rdv => rdv.statut === filters.statut);
    }

    if (filters.date) {
      filtered = filtered.filter(rdv => {
        if (!rdv.date_rv) return false;
        const rdvDate = new Date(rdv.date_rv).toISOString().split('T')[0];
        return rdvDate === filters.date;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(rdv => {
        const patient = patients.find(p => p.id === rdv.id_patient);
        const medecin = medecins.find(m => m.id === rdv.id_medecin);
        
        return (
          (patient?.nom || '').toLowerCase().includes(searchLower) ||
          (patient?.prenom || '').toLowerCase().includes(searchLower) ||
          (medecin?.nom || '').toLowerCase().includes(searchLower) ||
          (medecin?.prenom || '').toLowerCase().includes(searchLower) ||
          (rdv.motif || '').toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredRendezVous(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitRendezVous = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Préparer les données avec la date et l'heure complètes
      const dateTime = `${formData.date_rv} ${formData.heure_rv}`;
      
      const rendezVousData = {
        id_patient: parseInt(formData.id_patient),
        id_medecin: parseInt(formData.id_medecin),
        date_rv: dateTime,
        motif: formData.motif,
        statut: 'prévu'
      };

      console.log('Envoi des données:', rendezVousData);
      const response = await rendezVousAPI.createRendezVous(rendezVousData);
      console.log('Réponse API:', response.data);
      
      setSuccess('Rendez-vous créé avec succès!');
      setShowModal(false);
      setFormData({
        id_patient: '',
        id_medecin: '',
        date_rv: '',
        heure_rv: '09:00:00',
        motif: ''
      });
      
      // Recharger la liste
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la création du rendez-vous';
      setError(`Erreur: ${errorMessage}`);
      console.error('Erreur détaillée création:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRendezVous = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
      try {
        await rendezVousAPI.deleteRendezVous(id);
        setSuccess('Rendez-vous supprimé avec succès!');
        loadRendezVous();
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la suppression du rendez-vous';
        setError(`Erreur: ${errorMessage}`);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await rendezVousAPI.updateRendezVous(id, { statut: newStatus });
      setSuccess('Statut mis à jour avec succès!');
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du statut';
      setError(`Erreur: ${errorMessage}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'prévu': 'warning',
      'confirmé': 'info',
      'terminé': 'success',
      'annulé': 'danger'
    };
    return statusConfig[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'prévu': 'Prévu',
      'confirmé': 'Confirmé',
      'terminé': 'Terminé',
      'annulé': 'Annulé'
    };
    return statusTexts[status] || status;
  };

  const getStatusActions = (rdv) => {
    switch (rdv.statut) {
      case 'prévu':
        return (
          <>
            <Button 
              variant="outline-success" 
              size="sm" 
              title="Confirmer"
              onClick={() => handleUpdateStatus(rdv.idR, 'confirmé')}
            >
              <i className="fas fa-check"></i>
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm" 
              title="Annuler"
              onClick={() => handleUpdateStatus(rdv.idR, 'annulé')}
            >
              <i className="fas fa-times"></i>
            </Button>
          </>
        );
      case 'confirmé':
        return (
          <Button 
            variant="outline-success" 
            size="sm" 
            title="Marquer comme terminé"
            onClick={() => handleUpdateStatus(rdv.idR, 'terminé')}
          >
            <i className="fas fa-check-double"></i>
          </Button>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide'+error;
    }
  };

  const getPatientInfo = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient || {};
  };

  const getMedecinInfo = (medecinId) => {
    const medecin = medecins.find(m => m.id === medecinId);
    return medecin || {};
  };

  const stats = {
    total: rendezVous.length,
    planned: rendezVous.filter(rdv => rdv.statut === 'prévu').length,
    confirmed: rendezVous.filter(rdv => rdv.statut === 'confirmé').length,
    completed: rendezVous.filter(rdv => rdv.statut === 'terminé').length
  };

  if ((loading && rendezVous.length === 0) || loadingData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p>Chargement des données...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* En-tête avec bouton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Gestion des Rendez-vous</h1>
          <p className="text-muted">
            Interface réceptionniste - Gestion complète des rendez-vous
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>
          Nouveau Rendez-vous
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <Alert.Heading>Erreur</Alert.Heading>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-primary mb-2">
                <i className="fas fa-calendar-alt fa-2x"></i>
              </div>
              <h4 className="text-primary">{stats.total}</h4>
              <p className="text-muted mb-0">Total RDV</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-warning mb-2">
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h4 className="text-warning">{stats.planned}</h4>
              <p className="text-muted mb-0">Prévus</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-info mb-2">
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <h4 className="text-info">{stats.confirmed}</h4>
              <p className="text-muted mb-0">Confirmés</p>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <div className="text-success mb-2">
                <i className="fas fa-check-double fa-2x"></i>
              </div>
              <h4 className="text-success">{stats.completed}</h4>
              <p className="text-muted mb-0">Terminés</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filtres */}
      <Card className="modern-card mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Filtres
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  value={filters.statut}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="prévu">Prévu</option>
                  <option value="confirmé">Confirmé</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Recherche</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par patient, médecin ou motif..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({ statut: '', date: '', search: '' })}
                className="w-100"
              >
                <i className="fas fa-times me-2"></i>
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tableau des rendez-vous */}
      <Card className="modern-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Tous les Rendez-vous
          </h5>
          <Badge bg="primary">{filteredRendezVous.length} rendez-vous</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0 modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date et Heure</th>
                <th>Statut</th>
                <th>Motif</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRendezVous.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                    <p className="text-muted">Aucun rendez-vous trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredRendezVous.map((rdv) => {
                  const patient = getPatientInfo(rdv.id_patient);
                  const medecin = getMedecinInfo(rdv.id_medecin);
                  
                  return (
                    <tr key={rdv.idR}>
                      <td>#{rdv.idR}</td>
                      <td>
                        {patient.nom ? (
                          <>
                            <strong>{patient.nom} {patient.prenom}</strong>
                            {patient.CIN && (
                              <div>
                                <small className="text-muted">CIN: {patient.CIN}</small>
                              </div>
                            )}
                            {patient.num_tel && (
                              <div>
                                <small className="text-muted">📞 {patient.num_tel}</small>
                              </div>
                            )}
                          </>
                        ) : (
                          <div>
                            <strong>Patient ID: {rdv.id_patient}</strong>
                            <div>
                              <small className="text-warning">
                                <Spinner animation="border" size="sm" className="me-1" />
                                Chargement...
                              </small>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        {medecin.nom ? (
                          <>
                            <strong>{medecin.nom} {medecin.prenom}</strong>
                            {medecin.specialite && (
                              <div>
                                <small className="text-muted">{medecin.specialite}</small>
                              </div>
                            )}
                          </>
                        ) : (
                          <div>
                            <strong>Médecin ID: {rdv.id_medecin}</strong>
                            <div>
                              <small className="text-warning">
                                <Spinner animation="border" size="sm" className="me-1" />
                                Chargement...
                              </small>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-nowrap">
                          {formatDate(rdv.date_rv)}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(rdv.statut)} className="fs-6">
                          {getStatusText(rdv.statut)}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-break">
                          <small className="text-muted">{rdv.motif || 'Non spécifié'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {getStatusActions(rdv)}
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            title="Supprimer"
                            onClick={() => handleDeleteRendezVous(rdv.idR)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de prise de rendez-vous */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-plus me-2"></i>
            Nouveau Rendez-vous
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRendezVous}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select
                    name="id_patient"
                    value={formData.id_patient}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Sélectionnez un patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom} {patient.CIN && `- CIN: ${patient.CIN}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {patients.length} patient(s) disponible(s)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin *</Form.Label>
                  <Form.Select
                    name="id_medecin"
                    value={formData.id_medecin}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Sélectionnez un médecin</option>
                    {medecins.map(medecin => (
                      <option key={medecin.id} value={medecin.id}>
                        {medecin.nom} {medecin.prenom} - {medecin.specialite}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {medecins.length} médecin(s) disponible(s)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date du rendez-vous *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_rv"
                    value={formData.date_rv}
                    onChange={handleFormChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure *</Form.Label>
                  <Form.Select
                    name="heure_rv"
                    value={formData.heure_rv}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="09:00:00">09:00</option>
                    <option value="10:00:00">10:00</option>
                    <option value="11:00:00">11:00</option>
                    <option value="14:00:00">14:00</option>
                    <option value="15:00:00">15:00</option>
                    <option value="16:00:00">16:00</option>
                    <option value="17:00:00">17:00</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Motif de la consultation *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="motif"
                placeholder="Décrivez le motif de la consultation..."
                value={formData.motif}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading || patients.length === 0 || medecins.length === 0}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Création...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Créer le Rendez-vous
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RendezVousReceptionniste;