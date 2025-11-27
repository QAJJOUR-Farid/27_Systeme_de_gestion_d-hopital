import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    CIN: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    email: '',
    password: '',
    confirmPassword: '',
    adresse: '',
    num_tel: '',
    role: 'patient', // ← Rôle par défaut
    // Champs spécifiques aux rôles
    service: '', // Infirmier
    annee_travail: '', // Médecin
    specialite: '', // Médecin
    description: '', // Médecin
    gender: '', // Patient
    poids: '', // Patient
    height: '' // Patient
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation basique
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    const result = await register(formData, formData.role);
    
    if (result.success) {
      alert(result.message);
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'infirmier':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Service</Form.Label>
            <Form.Control
              type="text"
              name="service"
              placeholder="Service d'affectation"
              value={formData.service}
              onChange={handleChange}
              required
            />
          </Form.Group>
        );
      
      case 'medecin':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Année de travail</Form.Label>
              <Form.Control
                type="number"
                name="annee_travail"
                placeholder="Année de début de travail"
                value={formData.annee_travail}
                onChange={handleChange}
                required
                min="2000"
                max={new Date().getFullYear()}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Spécialité</Form.Label>
              <Form.Control
                type="text"
                name="specialite"
                placeholder="Spécialité médicale"
                value={formData.specialite}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Description professionnelle"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        );
      
      case 'patient':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Genre</Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez le genre</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Poids (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="poids"
                placeholder="Poids en kg"
                value={formData.poids}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Taille (cm)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="height"
                placeholder="Taille en cm"
                value={formData.height}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={5}>
          <Card className="modern-card shadow-lg">
            <Card.Header className="text-center py-4">
              <h3 className="mb-0">
                <i className="fas fa-hospital me-2"></i>
                MediCare Pro
              </h3>
              <p className="text-muted mb-0">Créer un nouveau compte</p>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* Sélecteur de rôle SIMPLE */}
                <Form.Group className="mb-4">
                  <Form.Label>Type de compte</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="patient"> Patient</option>
                    <option value="medecin"> Médecin</option>
                    <option value="infirmier"> Infirmier</option>
                    <option value="receptionniste"> Réceptionniste</option>
                    <option value="magasinier"> Magasinier</option>
                    <option value="admin"> Administrateur</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Sélectionnez le type de compte que vous souhaitez créer
                  </Form.Text>
                </Form.Group>

                {/* Champs communs à tous les rôles */}
                <Form.Group className="mb-3">
                  <Form.Label>CIN *</Form.Label>
                  <Form.Control
                    type="text"
                    name="CIN"
                    placeholder="Numéro CIN"
                    value={formData.CIN}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom"
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control
                    type="text"
                    name="prenom"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Votre email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le mot de passe *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="adresse"
                    placeholder="Votre adresse complète"
                    value={formData.adresse}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="num_tel"
                    placeholder="Votre numéro de téléphone"
                    value={formData.num_tel}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Champs spécifiques au rôle */}
                {renderRoleSpecificFields()}

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 btn-modern"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Création du compte...
                    </>
                  ) : (
                    `Créer un compte ${formData.role}`
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="text-muted">
                  Déjà un compte? <Link to="/login" className="text-primary">Se connecter</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;