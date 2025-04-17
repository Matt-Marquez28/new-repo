<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h1 className="h3 fw-bold">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            Job Fair Event Details
          </h1>
          <p className="text-muted mb-0">
            Track pre-registrations, attendance rates, and participant
            demographics
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-person-plus text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Pre-Registrations</h6>
                  <h3 className="mb-0">{stats.totalPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-people text-info fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Job Seekers</h6>
                  <h3 className="mb-0">{stats.jobSeekersPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-building text-success fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Employers</h6>
                  <h3 className="mb-0">{stats.employersPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-calendar-check text-warning fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Attendance</h6>
                  <h3 className="mb-0">
                    {stats.totalAttendance}{" "}
                    <small className="text-muted fs-6">
                      ({stats.attendanceRate}%)
                    </small>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>