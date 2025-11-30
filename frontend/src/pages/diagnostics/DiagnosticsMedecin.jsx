import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Button,
  Alert,
  Spinner,
  Card,
  Badge,
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import { diagnosticsAPI, userAPI } from '../../Services/api';
import { useAuth } from '../../hooks/useAuth';

const DiagnosticsMedecin = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [medecinsCache, setMedecinsCache] = useState({});
  const [patientsCache, setPatientsCache] = useState({});
  const [loadingMedecins, setLoadingMedecins] = useState({});
  const [loadingPatients, setLoadingPatients] = useState({});
  const [currentMedecinId, setCurrentMedecinId] = useState(null);

  useEffect(() => {
    if (user && user.CIN) {
      loadCurrentMedecin();
    }
  }, [user]);

  useEffect(() => {
    if (currentMedecinId) {
      loadDiagnostics();
    }
  }, [currentMedecinId]);

  const loadCurrentMedecin = async () => {
    if (!user || !user.CIN) return;

    try {
      const response = await userAPI.getAllMedecins();
      const medecin = response.data.find(m => m.CIN === user.CIN);
      if (medecin) {
        setCurrentMedecinId(medecin.id_medecin);
      } else {
        setError('Médecin non trouvé dans la base de données');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du médecin:', err);
      setError('Erreur lors du chargement des informations du médecin');
    }
  };

  const loadDiagnostics = async () => {
    if (!currentMedecinId) {
      setError('Médecin non identifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await diagnosticsAPI.getDiagnostics();
      
      // Filtrer pour ne montrer que les diagnostics du médecin connecté
      const medecinDiagnostics = response.data.filter(
        diagnostic => diagnostic.id_medecin == currentMedecinId
      );
      
      console.log('Diagnostics du médecin chargés:', medecinDiagnostics);
      setDiagnostics(medecinDiagnostics);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des diagnostics';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger un médecin individuellement avec gestion du cache
  const loadMedecin = useCallback(async (medecinId) => {
    if (!medecinId || medecinsCache[medecinId] || loadingMedecins[medecinId]) {
      return;
    }

    try {
      setLoadingMedecins(prev => ({ ...prev, [medecinId]: true }));
      const response = await userAPI.getMedecinById(medecinId);
      setMedecinsCache(prev => ({
        ...prev,
        [medecinId]: response.data
      }));
    } catch (err) {
      console.error(`Erreur lors du chargement du médecin ${medecinId}:`, err);
      setMedecinsCache(prev => ({
        ...prev,
        [medecinId]: { error: true, id: medecinId }
      }));
    } finally {
      setLoadingMedecins(prev => ({ ...prev, [medecinId]: false }));
    }
  }, [medecinsCache, loadingMedecins]);

  // Charger un patient individuellement avec gestion du cache
  const loadPatient = useCallback(async (patientId) => {
    if (!patientId || patientsCache[patientId] || loadingPatients[patientId]) {
      return;
    }

    try {
      setLoadingPatients(prev => ({ ...prev, [patientId]: true }));
      const response = await userAPI.getPatientById(patientId);
      setPatientsCache(prev => ({
        ...prev,
        [patientId]: response.data
      }));
    } catch (err) {
      console.error(`Erreur lors du chargement du patient ${patientId}:`, err);
      setPatientsCache(prev => ({
        ...prev,
        [patientId]: { error: true, id: patientId }
      }));
    } finally {
      setLoadingPatients(prev => ({ ...prev, [patientId]: false }));
    }
  }, [patientsCache, loadingPatients]);

  // Charger les données manquantes pour un diagnostic spécifique
  const loadMissingDataForDiagnostic = useCallback((diagnostic) => {
    if (diagnostic.id_medecin && !medecinsCache[diagnostic.id_medecin] && !loadingMedecins[diagnostic.id_medecin]) {
      loadMedecin(diagnostic.id_medecin);
    }
    
    if (diagnostic.id_patient && !patientsCache[diagnostic.id_patient] && !loadingPatients[diagnostic.id_patient]) {
      loadPatient(diagnostic.id_patient);
    }
  }, [medecinsCache, patientsCache, loadingMedecins, loadingPatients, loadMedecin, loadPatient]);

  // Charger les données pour tous les diagnostics visibles
  useEffect(() => {
    diagnostics.forEach(diagnostic => {
      loadMissingDataForDiagnostic(diagnostic);
    });
  }, [diagnostics, loadMissingDataForDiagnostic]);

  // Fonction pour obtenir l'ID du diagnostic de manière fiable
  const getDiagnosticId = (diagnostic) => {
    return diagnostic.idD || diagnostic.id || diagnostic.id_diagnostic;
  };

  const handleShowDetailModal = (diagnostic) => {
    loadMissingDataForDiagnostic(diagnostic);
    setSelectedDiagnostic(diagnostic);
    setShowDetailModal(true);
    setError('');
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDiagnostic(null);
    setError('');
  };

  const handleApproveDiagnostic = async (diagnostic) => {
    const diagnosticId = getDiagnosticId(diagnostic);

    if (!diagnosticId) {
      setError('ID du diagnostic manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir approuver ce diagnostic ?')) {
      try {
        setSubmitting(true);

        // Préparer les données pour la mise à jour
        const updateData = {
          ...diagnostic,
          etat: 'approuver'
        };

        // Utiliser l'endpoint updateDiagnostic avec l'ID
        await diagnosticsAPI.updateDiagnostic(diagnosticId, updateData);

        // Mettre à jour l'état local immédiatement pour une meilleure UX
        setDiagnostics(prev => prev.map(d =>
          getDiagnosticId(d) === diagnosticId ? { ...d, etat: 'approuver' } : d
        ));

        alert('Diagnostic approuvé avec succès!');
        await loadDiagnostics();
        handleCloseDetailModal();

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de l\'approbation du diagnostic';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRejectDiagnostic = async (diagnostic) => {
    const diagnosticId = getDiagnosticId(diagnostic);

    if (!diagnosticId) {
      setError('ID du diagnostic manquant');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir refuser ce diagnostic ?')) {
      try {
        setSubmitting(true);

        // Préparer les données pour la mise à jour (remettre en attente)
        const updateData = {
          ...diagnostic,
          etat: 'enAttente'
        };

        // Utiliser l'endpoint updateDiagnostic avec l'ID
        await diagnosticsAPI.updateDiagnostic(diagnosticId, updateData);

        // Mettre à jour l'état local immédiatement pour une meilleure UX
        setDiagnostics(prev => prev.map(d =>
          getDiagnosticId(d) === diagnosticId ? { ...d, etat: 'enAttente' } : d
        ));

        alert('Diagnostic refusé avec succès!');
        await loadDiagnostics();
        handleCloseDetailModal();

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erreur lors du refus du diagnostic';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getFullName = (user) => {
    if (!user) return '';
    return `${user.prenom || ''} ${user.nom || ''}`.trim();
  };

  // Fonction pour obtenir le nom du patient (avec bouton de rechargement si erreur)
  const getPatientName = (diagnostic) => {
    const patientId = diagnostic.id_patient;
    if (!patientId) return 'N/A';

    const patient = patientsCache[patientId];

    if (loadingPatients[patientId]) {
      return <Spinner animation="border" size="sm" />;
    }

    if (patient && patient.error) {
      return (
        <div className="d-flex align-items-center">
          <span className="text-danger me-2">Patient #{patientId}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => loadPatient(patientId)}
            title="Recharger"
          >
            <i className="fas fa-redo"></i>
          </Button>
        </div>
      );
    }

    if (patient && patient.user) {
      return getFullName(patient.user);
    }

    if (patient && patient.prenom) {
      return `${patient.prenom} ${patient.nom || ''}`.trim();
    }

    // Si pas encore chargé, déclencher le chargement
    if (!patient && !loadingPatients[patientId]) {
      setTimeout(() => loadPatient(patientId), 0);
    }

    return `Patient #${patientId}`;
  };

  // Fonction pour obtenir le CIN du patient
  const getPatientCIN = (diagnostic) => {
    const patientId = diagnostic.id_patient;
    if (!patientId) return 'N/A';
    const patient = patientsCache[patientId];
    if (patient && !patient.error && patient.CIN) {
      return patient.CIN;
    }
    if (patient && !patient.error && patient.cin) {
      return patient.cin;
    }
    return 'N/A';
  };

  // Fonction pour générer une clé unique
  const getUniqueKey = (diagnostic, index) => {
    const diagnosticId = getDiagnosticId(diagnostic);
    return diagnosticId || `diagnostic-${index}-${Date.now()}`;
  };

  // Fonction pour obtenir le badge d'état
  const getEtatBadge = (etat) => {
    switch (etat) {
      case 'approuver':
      case 'approuvé':
      case 'approved':
        return <Badge bg="success">Approuvé</Badge>;
      case 'enAttente':
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      default:
        return <Badge bg="light" text="dark">{etat || 'N/A'}</Badge>;
    }
  };

  // Fonction pour vérifier si le diagnostic peut être approuvé/refusé
  const canApproveReject = (diagnostic) => {
    const pendingStates = ['enAttente', 'pending', 'en_attente'];
    return pendingStates.includes(diagnostic.etat);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mes Diagnostics</h1>
        <div>
          <small className="text-muted">
            Médecin ID: {currentMedecinId}
          </small>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stats-number">{diagnostics.length}</div>
              <div className="stats-label">Mes Diagnostics</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-warning">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stats-number">
                {diagnostics.filter(d => 
                  ['enAttente', 'pending', 'en_attente'].includes(d.etat)
                ).length}
              </div>
              <div className="stats-label">En Attente</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-success">
                <i className="fas fa-check"></i>
              </div>
              <div className="stats-number">
                {diagnostics.filter(d =>
                  ['approuver', 'approuvé', 'approved'].includes(d.etat)
                ).length}
              </div>
              <div className="stats-label">Approuvés</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="stats-card modern-card">
            <Card.Body>
              <div className="stats-icon text-danger">
                <i className="fas fa-times"></i>
              </div>
              <div className="stats-number">
                {diagnostics.filter(d => 
                  ['refusé', 'rejected'].includes(d.etat)
                ).length}
              </div>
              <div className="stats-label">Refusés</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Table striped bordered hover responsive className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>CIN Patient</th>
            <th>Date</th>
            <th>Description</th>
            <th>Résultats</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((diagnostic, index) => {
            const diagnosticId = getDiagnosticId(diagnostic);
            return (
              <tr key={getUniqueKey(diagnostic, index)}>
                <td>#{diagnosticId || 'N/A'}</td>
                <td>
                  <strong>{getPatientName(diagnostic)}</strong>
                  <br />
                  <small className="text-muted">ID: {diagnostic.id_patient || 'N/A'}</small>
                </td>
                <td>
                  {getPatientCIN(diagnostic)}
                </td>
                <td>{formatDate(diagnostic.dateD)}</td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '150px' }} title={diagnostic.description}>
                    {diagnostic.description || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '150px' }} title={diagnostic.resultats}>
                    {diagnostic.resultats || 'Non spécifié'}
                  </div>
                </td>
                <td>
                  {getEtatBadge(diagnostic.etat)}
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleShowDetailModal(diagnostic)}
                      title="Voir les détails"
                    >
                      <i className="fas fa-eye"></i>
                    </Button>
                    
                    {canApproveReject(diagnostic) && (
                      <>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleApproveDiagnostic(diagnostic)}
                          title="Approuver le diagnostic"
                          disabled={submitting}
                        >
                          <i className="fas fa-check"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRejectDiagnostic(diagnostic)}
                          title="Refuser le diagnostic"
                          disabled={submitting}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {diagnostics.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-stethoscope fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Aucun diagnostic trouvé</h4>
          <p className="text-muted">Vous n'avez aucun diagnostic assigné.</p>
        </div>
      )}

      {/* Modal pour voir les détails du diagnostic */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du Diagnostic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDiagnostic && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>ID du Diagnostic:</strong>
                  <br />
                  #{getDiagnosticId(selectedDiagnostic)}
                </Col>
                <Col md={6}>
                  <strong>Date:</strong>
                  <br />
                  {formatDate(selectedDiagnostic.dateD)}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Patient:</strong>
                  <br />
                  {getPatientName(selectedDiagnostic)}
                  <br />
                  <small className="text-muted">CIN: {getPatientCIN(selectedDiagnostic)}</small>
                  <br />
                  <small className="text-muted">ID: {selectedDiagnostic.id_patient}</small>
                </Col>
                <Col md={6}>
                  <strong>État:</strong>
                  <br />
                  {getEtatBadge(selectedDiagnostic.etat)}
                </Col>
              </Row>

              <hr />

              <Row className="mb-3">
                <Col>
                  <strong>Description:</strong>
                  <div className="p-3 bg-light rounded mt-2" style={{ minHeight: '100px' }}>
                    {selectedDiagnostic.description || 'Non spécifié'}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <strong>Résultats:</strong>
                  <div className="p-3 bg-light rounded mt-2" style={{ minHeight: '100px' }}>
                    {selectedDiagnostic.resultats || 'Non spécifié'}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedDiagnostic && canApproveReject(selectedDiagnostic) && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleApproveDiagnostic(selectedDiagnostic)}
                disabled={submitting}
              >
                <i className="fas fa-check me-2"></i>
                Approuver
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleRejectDiagnostic(selectedDiagnostic)}
                disabled={submitting}
              >
                <i className="fas fa-times me-2"></i>
                Refuser
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DiagnosticsMedecin;