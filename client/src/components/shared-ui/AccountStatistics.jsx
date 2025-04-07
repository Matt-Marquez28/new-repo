import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ACCOUNT_API_END_POINT } from '../../utils/constants';

const AccountStatistics = () => {
  const [stats, setStats] = useState({
    jobseekers: 0,
    employers: 0,
    totalActiveAccounts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ACCOUNT_API_END_POINT}/account-stats`);
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to load statistics');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Counter animation effect
  const [counters, setCounters] = useState({
    jobseekers: 0,
    employers: 0,
    totalActiveAccounts: 0
  });

  useEffect(() => {
    if (!loading) {
      const duration = 2000; // 2 seconds animation
      const steps = 50;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep += 1;
        const progress = Math.min(currentStep / steps, 1);
        
        setCounters({
          jobseekers: Math.floor(stats.jobseekers * progress),
          employers: Math.floor(stats.employers * progress),
          totalActiveAccounts: Math.floor(stats.totalActiveAccounts * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounters(stats);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [loading, stats]);

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="stats-section py-5" style={{
     
      borderRadius: "0",
      position: "relative",
      overflow: "hidden"
    }}>
      <div className="container position-relative" style={{ zIndex: "2" }}>
        <div className="row text-center mb-5">
          <div className="col-12">
            <h2 className="display-4 fw-bold" style={{ color: "#2c3e50" }}>Our Growing Community</h2>
            <p className="lead" style={{ color: "#34495e" }}>Join thousands of professionals already on our platform</p>
          </div>
        </div>
        
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: "#3498db" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="stat-item text-center p-4" style={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden",
                position: "relative",
                height: "100%"
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
              }}>
                <div className="icon-background" style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "rgba(52, 152, 219, 0.1)",
                  zIndex: "1"
                }}></div>
                <div className="position-relative" style={{ zIndex: "2" }}>
                  <div className="icon-container mb-4" style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(52, 152, 219, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto"
                  }}>
                    <i className="bi bi-people-fill" style={{ fontSize: "2.5rem", color: "#3498db" }}></i>
                  </div>
                  <h3 className="counter-value mb-0" style={{ fontSize: "3.5rem", fontWeight: "700", color: "#3498db" }}>
                    {counters.jobseekers.toLocaleString()}
                  </h3>
                  <h4 className="mt-2 mb-3" style={{ color: "#2c3e50", fontSize: "1.5rem" }}>Job Seekers</h4>
                  <div style={{ width: "50px", height: "3px", background: "#3498db", margin: "0 auto 15px" }}></div>
                  <p className="text-muted">Talented professionals looking for their next opportunity</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="stat-item text-center p-4" style={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden",
                position: "relative",
                height: "100%"
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
              }}>
                <div className="icon-background" style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "rgba(46, 204, 113, 0.1)",
                  zIndex: "1"
                }}></div>
                <div className="position-relative" style={{ zIndex: "2" }}>
                  <div className="icon-container mb-4" style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(46, 204, 113, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto"
                  }}>
                    <i className="bi bi-building" style={{ fontSize: "2.5rem", color: "#2ecc71" }}></i>
                  </div>
                  <h3 className="counter-value mb-0" style={{ fontSize: "3.5rem", fontWeight: "700", color: "#2ecc71" }}>
                    {counters.employers.toLocaleString()}
                  </h3>
                  <h4 className="mt-2 mb-3" style={{ color: "#2c3e50", fontSize: "1.5rem" }}>Employers</h4>
                  <div style={{ width: "50px", height: "3px", background: "#2ecc71", margin: "0 auto 15px" }}></div>
                  <p className="text-muted">Companies searching for the perfect candidates</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="stat-item text-center p-4" style={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                overflow: "hidden",
                position: "relative",
                height: "100%"
              }} 
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
              }}>
                <div className="icon-background" style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "rgba(155, 89, 182, 0.1)",
                  zIndex: "1"
                }}></div>
                <div className="position-relative" style={{ zIndex: "2" }}>
                  <div className="icon-container mb-4" style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(155, 89, 182, 0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto"
                  }}>
                    <i className="bi bi-person-check-fill" style={{ fontSize: "2.5rem", color: "#9b59b6" }}></i>
                  </div>
                  <h3 className="counter-value mb-0" style={{ fontSize: "3.5rem", fontWeight: "700", color: "#9b59b6" }}>
                    {counters.totalActiveAccounts.toLocaleString()}
                  </h3>
                  <h4 className="mt-2 mb-3" style={{ color: "#2c3e50", fontSize: "1.5rem" }}>Active Users</h4>
                  <div style={{ width: "50px", height: "3px", background: "#9b59b6", margin: "0 auto 15px" }}></div>
                  <p className="text-muted">Active members engaged on our platform daily</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="row mt-5">
          <div className="col-12 text-center">
            <button className="btn btn-lg px-5 py-3" style={{
              background: "linear-gradient(45deg, #3498db, #9b59b6)",
              border: "none",
              color: "white",
              borderRadius: "30px",
              boxShadow: "0 4px 15px rgba(52, 152, 219, 0.4)",
              fontWeight: "600",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(52, 152, 219, 0.6)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.4)";
            }}>
              Join Today <i className="bi bi-arrow-right-circle ms-2"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Background elements for visual interest */}
      <div className="shape shape-1" style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        width: "15px",
        height: "15px",
        borderRadius: "50%",
        background: "rgba(52, 152, 219, 0.4)",
        animation: "float 6s ease-in-out infinite"
      }}></div>
      <div className="shape shape-2" style={{
        position: "absolute",
        top: "60%",
        left: "15%",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "rgba(46, 204, 113, 0.4)",
        animation: "float 8s ease-in-out infinite"
      }}></div>
      <div className="shape shape-3" style={{
        position: "absolute",
        top: "30%",
        right: "10%",
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "rgba(155, 89, 182, 0.4)",
        animation: "float 7s ease-in-out infinite"
      }}></div>
      
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translateY(0) }
          50% { transform: translateY(-20px) }
          100% { transform: translateY(0) }
        }
      `}</style>
    </section>
  );
};

export default AccountStatistics;