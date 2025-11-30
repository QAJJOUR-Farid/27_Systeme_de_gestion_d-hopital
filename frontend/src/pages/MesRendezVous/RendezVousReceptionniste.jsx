import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { rendezVousAPI, userAPI, patientsAPI } from '../../Services/api';

const RendezVousReceptionniste = () => {
  const [state, setState] = useState({
    rendezVous: [],
    filteredRendezVous: [],
    loading: true,
    error: '',
    success: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ statut: '', date: '', search: '' });
  const [formData, setFormData] = useState({
    patient_cin: '', medecin_cin: '', date_rv: '', heure_rv: '09:00:00', motif: ''
  });
  const [data, setData] = useState({
    medecins: [], patients: [], patientsDetails: [], medecinsDetails: [], loadingData: true
  });

  const setStateValue = (key, value) => setState(prev => ({ ...prev, [key]: value }));
  const setDataValue = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  // Configuration des statuts
  const statusConfig = {
    'prévu': { badge: 'warning', text: 'Prévu', actions: ['confirmé', 'annulé'] },
    'confirmé': { badge: 'info', text: 'Confirmé', actions: ['terminé'] },
    'terminé': { badge: 'success', text: 'Terminé', actions: [] },
    'annulé': { badge: 'danger', text: 'Annulé', actions: [] }
  };

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const extractData = (response) => {
    return Array.isArray(response.data) ? response.data : 
           response.data?.data || response.data?.success?.data || [];
  };

  // Chargement des données
  const loadRendezVous = useCallback(async () => {
    try {
      setStateValue('loading', true);
      const response = await rendezVousAPI.getRendezVous();
      const rendezVousData = extractData(response);
      setStateValue('rendezVous', rendezVousData);
      setStateValue('error', '');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des rendez-vous';
      setStateValue('error', `Erreur: ${errorMessage}`);
    } finally {
      setStateValue('loading', false);
    }
  }, []);

  const loadUsersData = async () => {
    try {
      const response = await userAPI.getAllUsers();
      const usersData = extractData(response);
      
      setDataValue('patients', usersData.filter(user => user.role === 'patient'));
      setDataValue('medecins', usersData.filter(user => user.role === 'medecin'));
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des utilisateurs'+err);
    }
  };

  const loadPatientsDetails = async () => {
    try {
      const response = await patientsAPI.getAllPatients();
      setDataValue('patientsDetails', extractData(response));
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des détails patients'+err);
    }
  };

  const loadMedecinsDetails = async () => {
    try {
      const response = await userAPI.getAllMedecins();
      setDataValue('medecinsDetails', extractData(response));
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des détails médecins'+err);
    }
  };

  const loadInitialData = async () => {
    try {
      setDataValue('loadingData', true);
      await Promise.all([
        loadRendezVous(),
        loadUsersData(),
        loadPatientsDetails(),
        loadMedecinsDetails()
      ]);
    } catch (err) {
      setStateValue('error', 'Erreur lors du chargement des données'+err);
    } finally {
      setDataValue('loadingData', false);
    }
  };

  // Filtres
  const applyFilters = useCallback(() => {
    let filtered = [...state.rendezVous];

    if (filters.statut) filtered = filtered.filter(rdv => rdv.statut === filters.statut);
    
    if (filters.date) {
      filtered = filtered.filter(rdv => {
        if (!rdv.date_rv) return false;
        return new Date(rdv.date_rv).toISOString().split('T')[0] === filters.date;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(rdv => {
        const patient = getPatientInfo(rdv.id_patient);
        const medecin = getMedecinInfo(rdv.id_medecin);
        
        return (
          (patient?.nom || '').toLowerCase().includes(searchLower) ||
          (patient?.prenom || '').toLowerCase().includes(searchLower) ||
          (medecin?.nom || '').toLowerCase().includes(searchLower) ||
          (medecin?.prenom || '').toLowerCase().includes(searchLower) ||
          (rdv.motif || '').toLowerCase().includes(searchLower)
        );
      });
    }

    setStateValue('filteredRendezVous', filtered);
  }, [state.rendezVous, filters]);

  // Gestion des formulaires
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitRendezVous = async (e) => {
    e.preventDefault();
    
    try {
      setStateValue('loading', true);
      
      if (!formData.patient_cin || !formData.medecin_cin || !formData.date_rv || !formData.motif) {
        setStateValue('error', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      const patientDetail = data.patientsDetails.find(p => p.CIN === formData.patient_cin);
      const medecinDetail = data.medecinsDetails.find(m => m.CIN === formData.medecin_cin);

      if (!patientDetail || !medecinDetail) {
        setStateValue('error', 'Patient ou médecin non trouvé');
        return;
      }

      const rendezVousData = {
        id_patient: patientDetail.id_patient,
        id_medecin: medecinDetail.id_medecin,
        date_rv: `${formData.date_rv} ${formData.heure_rv}`,
        motif: formData.motif,
        statut: 'prévu',
        id_rec: 1
      };

      await rendezVousAPI.createRendezVous(rendezVousData);
      
      setStateValue('success', 'Rendez-vous créé avec succès!');
      setShowModal(false);
      setFormData({ patient_cin: '', medecin_cin: '', date_rv: '', heure_rv: '09:00:00', motif: '' });
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création';
      setStateValue('error', `Erreur: ${errorMessage}`);
    } finally {
      setStateValue('loading', false);
    }
  };

  const handleDeleteRendezVous = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
      try {
        await rendezVousAPI.deleteRendezVous(id);
        setStateValue('success', 'Rendez-vous supprimé avec succès!');
        loadRendezVous();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
        setStateValue('error', `Erreur: ${errorMessage}`);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await rendezVousAPI.updateRendezVous(id, { statut: newStatus });
      setStateValue('success', 'Statut mis à jour avec succès!');
      loadRendezVous();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setStateValue('error', `Erreur: ${errorMessage}`);
    }
  };

  // Récupération des informations
  const getPatientInfo = (patientId) => {
    const patientDetail = data.patientsDetails.find(p => p.id_patient === patientId);
    const patient = data.patients.find(p => p.CIN === patientDetail?.CIN);
    return patient || {};
  };

  const getMedecinInfo = (medecinId) => {
    const medecinDetail = data.medecinsDetails.find(m => m.id_medecin === medecinId);
    const medecin = data.medecins.find(m => m.CIN === medecinDetail?.CIN);
    return medecin || {};
  };

  const getStatusActions = (rdv) => {
    const { actions } = statusConfig[rdv.statut] || {};
    
    const buttonConfig = {
      'confirmé': { variant: 'outline-success', icon: 'fa-check', text: 'Confirmer' },
      'annulé': { variant: 'outline-danger', icon: 'fa-times', text: 'Annuler' },
      'terminé': { variant: 'outline-success', icon: 'fa-check-double', text: 'Terminer' }
    };

    return actions?.map(action => (
      <Button
        key={action}
        variant={buttonConfig[action]?.variant}
        size="sm"
        onClick={() => handleUpdateStatus(rdv.idR, action)}
      >
        <i className={`fas ${buttonConfig[action]?.icon}`}></i>
      </Button>
    ));
  };

  // Effects
  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { applyFilters(); }, [applyFilters]);

  const { loading, error, success, filteredRendezVous } = state;
  const { patients, medecins, loadingData } = data;

  const stats = {
    total: state.rendezVous.length,
    planned: state.rendezVous.filter(rdv => rdv.statut === 'prévu').length,
    confirmed: state.rendezVous.filter(rdv => rdv.statut === 'confirmé').length,
    completed: state.rendezVous.filter(rdv => rdv.statut === 'terminé').length
  };

  if ((loading && state.rendezVous.length === 0) || loadingData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" className="mb-3" />
          <p>Chargement des données...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Gestion des Rendez-vous</h1>
          <p className="text-muted">Interface réceptionniste</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i>Nouveau Rendez-vous
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setStateValue('error', '')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setStateValue('success', '')}>{success}</Alert>}

      {/* Statistiques */}
      <Row className="mb-4">
        {[
          { key: 'total', icon: 'fa-calendar-alt', color: 'primary', label: 'Total RDV' },
          { key: 'planned', icon: 'fa-clock', color: 'warning', label: 'Prévus' },
          { key: 'confirmed', icon: 'fa-check-circle', color: 'info', label: 'Confirmés' },
          { key: 'completed', icon: 'fa-check-double', color: 'success', label: 'Terminés' }
        ].map(({ key, icon, color, label }) => (
          <Col md={3} key={key}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <div className={`text-${color} mb-2`}><i className={`fas ${icon} fa-2x`}></i></div>
                <h4 className={`text-${color}`}>{stats[key]}</h4>
                <p className="text-muted mb-0">{label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtres */}
      <Card className="modern-card mb-4">
        <Card.Header><h5 className="mb-0"><i className="fas fa-filter me-2"></i>Filtres</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select value={filters.statut} onChange={(e) => handleFilterChange('statut', e.target.value)}>
                  <option value="">Tous les statuts</option>
                  {Object.keys(statusConfig).map(status => (
                    <option key={status} value={status}>{statusConfig[status].text}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" value={filters.date} onChange={(e) => handleFilterChange('date', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Recherche</Form.Label>
                <Form.Control type="text" placeholder="Patient, médecin ou motif..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={() => setFilters({ statut: '', date: '', search: '' })} className="w-100">
                <i className="fas fa-times me-2"></i>Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tableau */}
      <Card className="modern-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><i className="fas fa-list me-2"></i>Tous les Rendez-vous</h5>
          <Badge bg="primary">{filteredRendezVous.length} rendez-vous</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0 modern-table">
            <thead>
              <tr>
                
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
                  const status = statusConfig[rdv.statut] || {};

                  return (
                    <tr key={rdv.idR}>
                     
                      <td>
                        {patient.nom ? (
                          <>
                            <strong>{patient.nom} {patient.prenom}</strong>
                            <div><small className="text-muted">CIN: {patient.CIN}</small></div>
                            {patient.num_tel && <div><small className="text-muted">📞 {patient.num_tel}</small></div>}
                          </>
                        ) : <strong>Patient ID: {rdv.id_patient}</strong>}
                      </td>
                      <td>
                        {medecin.nom ? (
                          <>
                            <strong>{medecin.nom} {medecin.prenom}</strong>
                            <div><small className="text-muted">CIN: {medecin.CIN}</small></div>
                            {medecin.specialite && <div><small className="text-muted">{medecin.specialite}</small></div>}
                          </>
                        ) : <strong>Médecin ID: {rdv.id_medecin}</strong>}
                      </td>
                      <td className="text-nowrap">{formatDate(rdv.date_rv)}</td>
                      <td><Badge bg={status.badge}>{status.text}</Badge></td>
                      <td><small className="text-muted">{rdv.motif || 'Non spécifié'}</small></td>
                      <td>
                        <div className="btn-group">
                          {getStatusActions(rdv)}
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRendezVous(rdv.idR)}>
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-calendar-plus me-2"></i>Nouveau Rendez-vous</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitRendezVous}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select name="patient_cin" value={formData.patient_cin} onChange={handleFormChange} required>
                    <option value="">Sélectionnez un patient</option>
                    {patients.map(patient => (
                      <option key={patient.CIN} value={patient.CIN}>
                        {patient.nom} {patient.prenom} - CIN: {patient.CIN}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Médecin *</Form.Label>
                  <Form.Select name="medecin_cin" value={formData.medecin_cin} onChange={handleFormChange} required>
                    <option value="">Sélectionnez un médecin</option>
                    {medecins.map(medecin => (
                      <option key={medecin.CIN} value={medecin.CIN}>
                        {medecin.nom} {medecin.prenom} - {medecin.specialite}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control type="date" name="date_rv" value={formData.date_rv} onChange={handleFormChange} required min={new Date().toISOString().split('T')[0]} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure *</Form.Label>
                  <Form.Select name="heure_rv" value={formData.heure_rv} onChange={handleFormChange} required>
                    {['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00'].map(heure => (
                      <option key={heure} value={heure}>{heure.split(':')[0]}h{heure.split(':')[1]}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Motif *</Form.Label>
              <Form.Control as="textarea" rows={3} name="motif" value={formData.motif} onChange={handleFormChange} placeholder="Motif de la consultation..." required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" type="submit" disabled={loading || !patients.length || !medecins.length}>
              {loading ? <><Spinner size="sm" className="me-2" />Création...</> : <><i className="fas fa-save me-2"></i>Créer</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RendezVousReceptionniste;