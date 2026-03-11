-- =============================================================================
-- Seed 002: SDLC Template v4.0 - Universal Software Project Setup
-- =============================================================================
-- 14 milestones (Phase-0 + M1..M13), 40+ epics, 80+ issues, checklists
-- Counter caches are updated automatically via triggers (migration 012)
-- =============================================================================

-- ─── Template ────────────────────────────────────────────────────────────────

INSERT INTO sdlc_templates (id, version, name, description, is_active, published_at)
VALUES (
  '019534b0-0000-7000-8000-000000000001',
  'v4.0',
  'Universal Software Project Setup Template',
  'Comprehensive SDLC template covering governance, discovery, architecture, development, testing, deployment, and operations. Supports greenfield and brownfield projects across WEB, MOBILE, DATA, AI, K8S, and BLOCKCHAIN domains.',
  true,
  now()
);

-- ─── Milestones ──────────────────────────────────────────────────────────────

-- PHASE-0: Governance & Compliance
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000001', '019534b0-0000-7000-8000-000000000001', 0, 'PHASE-0', 'Governance & Compliance', 'Establish regulatory and compliance framework before project kickoff.', '["WEB","MOBILE","DATA","AI","K8S","BLOCKCHAIN","ENTERPRISE"]', true);

-- M1: Discovery & Planning
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000002', '019534b0-0000-7000-8000-000000000001', 1, 'M1', 'Discovery & Planning', 'Understand business context, stakeholders, scope, and define project roadmap.', '["WEB","MOBILE","DATA","AI","K8S","BLOCKCHAIN"]', true);

-- M2: Architecture & Technical Design
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000003', '019534b0-0000-7000-8000-000000000001', 2, 'M2', 'Architecture & Technical Design', 'Define system architecture, tech stack, patterns, and infrastructure decisions.', '["WEB","MOBILE","DATA","AI","K8S","BLOCKCHAIN"]', true);

-- M3: Environment & Infrastructure Setup
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000004', '019534b0-0000-7000-8000-000000000001', 3, 'M3', 'Environment & Infrastructure Setup', 'Provision cloud environments, CI/CD pipelines, and development tooling.', '["WEB","MOBILE","DATA","AI","K8S"]', true);

-- M4: Data Modeling & Database Design
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000005', '019534b0-0000-7000-8000-000000000001', 4, 'M4', 'Data Modeling & Database Design', 'Design data models, schemas, migration strategies, and data governance.', '["WEB","MOBILE","DATA","AI"]', true);

-- M5: Authentication & Authorization
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000006', '019534b0-0000-7000-8000-000000000001', 5, 'M5', 'Authentication & Authorization', 'Implement identity management, RBAC, OAuth, SSO, and session handling.', '["WEB","MOBILE","DATA"]', true);

-- M6: Core Backend Development
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000007', '019534b0-0000-7000-8000-000000000001', 6, 'M6', 'Core Backend Development', 'Build APIs, business logic, domain services, and integration layers.', '["WEB","MOBILE","DATA","AI"]', true);

-- M7: Frontend Development
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000008', '019534b0-0000-7000-8000-000000000001', 7, 'M7', 'Frontend Development', 'Build UI components, pages, responsive design, and client-side state.', '["WEB","MOBILE"]', true);

-- M8: AI/ML Pipeline
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000009', '019534b0-0000-7000-8000-000000000001', 8, 'M8', 'AI/ML Pipeline', 'Design and implement ML pipelines, model training, inference, and monitoring.', '["AI","DATA"]', false);

-- M9: Testing & Quality Assurance
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000010', '019534b0-0000-7000-8000-000000000001', 9, 'M9', 'Testing & Quality Assurance', 'Establish testing strategy: unit, integration, E2E, performance, and security tests.', '["WEB","MOBILE","DATA","AI","K8S"]', true);

-- M10: Security Hardening
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000011', '019534b0-0000-7000-8000-000000000001', 10, 'M10', 'Security Hardening', 'Apply OWASP top 10 mitigations, penetration testing, and security review.', '["WEB","MOBILE","DATA","AI","K8S","BLOCKCHAIN"]', true);

-- M11: Deployment & Release
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000012', '019534b0-0000-7000-8000-000000000001', 11, 'M11', 'Deployment & Release', 'Define release strategy, blue-green/canary deployments, and rollback procedures.', '["WEB","MOBILE","DATA","AI","K8S"]', true);

-- M12: Monitoring & Observability
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000013', '019534b0-0000-7000-8000-000000000001', 12, 'M12', 'Monitoring & Observability', 'Set up logging, metrics, tracing, alerting, and dashboards for production.', '["WEB","MOBILE","DATA","AI","K8S"]', true);

-- M13: Documentation & Handoff
INSERT INTO template_milestones (id, template_id, sort_order, code, name, objective, applicability_tags, is_required) VALUES
('019534b0-1000-7000-8000-000000000014', '019534b0-0000-7000-8000-000000000001', 13, 'M13', 'Documentation & Handoff', 'Produce technical docs, runbooks, onboarding guides, and project handoff materials.', '["WEB","MOBILE","DATA","AI","K8S","BLOCKCHAIN"]', true);


-- ─── Epics ───────────────────────────────────────────────────────────────────

-- PHASE-0 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0001-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000001', 0, 'Regulatory & Compliance Assessment', 'Identify all applicable regulations (LGPD, GDPR, PCI-DSS, SOX, HIPAA).', '["ENTERPRISE"]'),
('019534c0-0001-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000001', 1, 'Licensing & Legal Review', 'Review open-source licenses, vendor agreements, and IP concerns.', '["ENTERPRISE","STARTUP-MINIMAL"]'),
('019534c0-0001-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000001', 2, 'Risk Assessment & Mitigation', 'Identify project risks and define mitigation strategies.', '["ENTERPRISE","STARTUP-MINIMAL"]');

-- M1 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0002-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000002', 0, 'Stakeholder Mapping', 'Identify and classify all project stakeholders.', '[]'),
('019534c0-0002-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000002', 1, 'Requirements Gathering', 'Collect functional and non-functional requirements.', '[]'),
('019534c0-0002-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000002', 2, 'Scope Definition & MVP', 'Define project scope, MVP boundaries, and out-of-scope items.', '[]'),
('019534c0-0002-7000-8000-000000000004', '019534b0-1000-7000-8000-000000000002', 3, 'Roadmap & Timeline', 'Create project roadmap with milestones and delivery dates.', '[]');

-- M2 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0003-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000003', 0, 'System Architecture Design', 'Define high-level system architecture (monolith, microservices, serverless).', '[]'),
('019534c0-0003-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000003', 1, 'Tech Stack Selection', 'Evaluate and select technologies for frontend, backend, database, and infra.', '[]'),
('019534c0-0003-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000003', 2, 'API Design & Contracts', 'Define API standards, versioning, and interface contracts.', '[]'),
('019534c0-0003-7000-8000-000000000004', '019534b0-1000-7000-8000-000000000003', 3, 'Integration Architecture', 'Map third-party integrations, webhooks, and event-driven flows.', '["ENTERPRISE"]');

-- M3 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0004-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000004', 0, 'Cloud Infrastructure Provisioning', 'Set up cloud accounts, VPCs, networking, and IAM policies.', '[]'),
('019534c0-0004-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000004', 1, 'CI/CD Pipeline Setup', 'Configure build, test, and deployment pipelines.', '[]'),
('019534c0-0004-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000004', 2, 'Development Environment', 'Set up local dev environment, Docker Compose, and dev tooling.', '[]');

-- M4 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0005-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000005', 0, 'Data Model Design', 'Design entity relationships, normalization, and schema.', '[]'),
('019534c0-0005-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000005', 1, 'Migration Strategy', 'Define database migration tooling, versioning, and rollback procedures.', '[]'),
('019534c0-0005-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000005', 2, 'Data Governance & Privacy', 'Define data classification, retention policies, and PII handling.', '["ENTERPRISE"]');

-- M5 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0006-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000006', 0, 'Authentication Implementation', 'Implement login, registration, password reset, and MFA.', '[]'),
('019534c0-0006-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000006', 1, 'Authorization & RBAC', 'Implement role-based access control and permission management.', '[]'),
('019534c0-0006-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000006', 2, 'SSO & OAuth Integration', 'Integrate with external identity providers (Google, Azure AD, Okta).', '["ENTERPRISE"]');

-- M6 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0007-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000007', 0, 'Domain Services & Business Logic', 'Implement core domain services and business rules.', '[]'),
('019534c0-0007-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000007', 1, 'API Development', 'Build REST/GraphQL endpoints with validation and error handling.', '[]'),
('019534c0-0007-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000007', 2, 'Background Jobs & Queues', 'Implement async processing, job queues, and scheduled tasks.', '["ENTERPRISE"]');

-- M7 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0008-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000008', 0, 'Design System & Components', 'Build reusable UI component library and design tokens.', '[]'),
('019534c0-0008-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000008', 1, 'Page Development', 'Implement application pages and navigation flows.', '[]'),
('019534c0-0008-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000008', 2, 'State Management & Data Fetching', 'Implement client-side state management and API integration.', '[]');

-- M8 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-0009-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000009', 0, 'ML Pipeline Architecture', 'Design data ingestion, feature engineering, and model training pipelines.', '["AI"]'),
('019534c0-0009-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000009', 1, 'Model Training & Evaluation', 'Implement model training, hyperparameter tuning, and evaluation metrics.', '["AI"]'),
('019534c0-0009-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000009', 2, 'Inference & Serving', 'Deploy model serving infrastructure and API endpoints.', '["AI"]');

-- M9 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-000a-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000010', 0, 'Testing Strategy', 'Define test pyramid, coverage targets, and testing tools.', '[]'),
('019534c0-000a-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000010', 1, 'Unit & Integration Tests', 'Write unit and integration tests for critical paths.', '[]'),
('019534c0-000a-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000010', 2, 'E2E & Performance Tests', 'Implement end-to-end and load/stress testing.', '["ENTERPRISE"]');

-- M10 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-000b-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000011', 0, 'OWASP Top 10 Review', 'Audit application against OWASP top 10 vulnerabilities.', '[]'),
('019534c0-000b-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000011', 1, 'Penetration Testing', 'Conduct security testing and vulnerability scanning.', '["ENTERPRISE"]'),
('019534c0-000b-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000011', 2, 'Security Configuration', 'Harden infrastructure, secrets management, and network policies.', '[]');

-- M11 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-000c-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000012', 0, 'Release Strategy', 'Define versioning, branching, and release cadence.', '[]'),
('019534c0-000c-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000012', 1, 'Deployment Automation', 'Implement blue-green/canary deployment and rollback procedures.', '[]'),
('019534c0-000c-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000012', 2, 'Database Migration Execution', 'Plan and execute production database migrations safely.', '[]');

-- M12 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-000d-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000013', 0, 'Logging & Tracing', 'Implement structured logging, distributed tracing, and correlation IDs.', '[]'),
('019534c0-000d-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000013', 1, 'Metrics & Alerting', 'Set up application and infrastructure metrics with alerting rules.', '[]'),
('019534c0-000d-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000013', 2, 'Dashboards & SLOs', 'Create operational dashboards and define SLIs/SLOs.', '["ENTERPRISE"]');

-- M13 Epics
INSERT INTO template_epics (id, milestone_id, sort_order, name, description, applicability_tags) VALUES
('019534c0-000e-7000-8000-000000000001', '019534b0-1000-7000-8000-000000000014', 0, 'Technical Documentation', 'Write architecture docs, API docs, and ADRs.', '[]'),
('019534c0-000e-7000-8000-000000000002', '019534b0-1000-7000-8000-000000000014', 1, 'Runbooks & Playbooks', 'Create incident response runbooks and operational playbooks.', '[]'),
('019534c0-000e-7000-8000-000000000003', '019534b0-1000-7000-8000-000000000014', 2, 'Onboarding & Handoff', 'Prepare developer onboarding guides and project handoff materials.', '[]');


-- ─── Issues ──────────────────────────────────────────────────────────────────

-- PHASE-0 / Regulatory & Compliance Assessment
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0001-7000-8000-000000000001', '019534c0-0001-7000-8000-000000000001', 0, 'Regulatory Requirements Inventory', 'List all regulations applicable to the project domain and geography.', '["ENTERPRISE"]', 0),
('019534d0-0001-7000-8000-000000000002', '019534c0-0001-7000-8000-000000000001', 1, 'LGPD/GDPR Data Protection Assessment', 'Identify personal data flows and define consent/legal basis for processing.', '["ENTERPRISE"]', 0),
('019534d0-0001-7000-8000-000000000003', '019534c0-0001-7000-8000-000000000001', 2, 'Compliance Checklist Creation', 'Create a compliance matrix mapping requirements to implementation tasks.', '["ENTERPRISE"]', 0);

-- PHASE-0 / Licensing & Legal Review
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0002-7000-8000-000000000001', '019534c0-0001-7000-8000-000000000002', 0, 'Open Source License Audit', 'Review all dependencies for license compatibility (MIT, Apache, GPL, etc.).', '[]', 0),
('019534d0-0002-7000-8000-000000000002', '019534c0-0001-7000-8000-000000000002', 1, 'Vendor Agreement Review', 'Review SaaS vendor agreements, SLAs, and data processing terms.', '["ENTERPRISE"]', 0);

-- PHASE-0 / Risk Assessment
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0003-7000-8000-000000000001', '019534c0-0001-7000-8000-000000000003', 0, 'Risk Matrix Definition', 'Identify risks by likelihood and impact, define mitigation strategies.', '[]', 0),
('019534d0-0003-7000-8000-000000000002', '019534c0-0001-7000-8000-000000000003', 1, 'Contingency Planning', 'Define fallback plans for critical risk scenarios.', '["ENTERPRISE"]', 0);

-- M1 / Stakeholder Mapping
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0004-7000-8000-000000000001', '019534c0-0002-7000-8000-000000000001', 0, 'Stakeholder Identification', 'List all internal and external stakeholders with roles and influence level.', '[]', 0),
('019534d0-0004-7000-8000-000000000002', '019534c0-0002-7000-8000-000000000001', 1, 'Communication Plan', 'Define communication cadence, channels, and reporting structure.', '[]', 0);

-- M1 / Requirements Gathering
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0005-7000-8000-000000000001', '019534c0-0002-7000-8000-000000000002', 0, 'Functional Requirements Document', 'Document user stories, acceptance criteria, and business rules.', '[]', 0),
('019534d0-0005-7000-8000-000000000002', '019534c0-0002-7000-8000-000000000002', 1, 'Non-Functional Requirements', 'Define performance, scalability, availability, and security requirements.', '[]', 0),
('019534d0-0005-7000-8000-000000000003', '019534c0-0002-7000-8000-000000000002', 2, 'User Personas & Journeys', 'Create user personas and map key user journeys.', '[]', 0);

-- M1 / Scope Definition & MVP
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0006-7000-8000-000000000001', '019534c0-0002-7000-8000-000000000003', 0, 'MVP Feature Set', 'Define minimum viable feature set for first release.', '[]', 0),
('019534d0-0006-7000-8000-000000000002', '019534c0-0002-7000-8000-000000000003', 1, 'Out-of-Scope Documentation', 'Explicitly document what is NOT included in scope.', '[]', 0);

-- M1 / Roadmap
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0007-7000-8000-000000000001', '019534c0-0002-7000-8000-000000000004', 0, 'Project Roadmap Creation', 'Create timeline with milestones, dependencies, and delivery dates.', '[]', 0),
('019534d0-0007-7000-8000-000000000002', '019534c0-0002-7000-8000-000000000004', 1, 'Resource Planning', 'Define team composition, roles, and allocation per phase.', '[]', 0);

-- M2 / System Architecture Design
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0008-7000-8000-000000000001', '019534c0-0003-7000-8000-000000000001', 0, 'Architecture Style Decision', 'Choose architecture pattern: monolith, modular monolith, microservices, or serverless.', '[]', 0),
('019534d0-0008-7000-8000-000000000002', '019534c0-0003-7000-8000-000000000001', 1, 'System Context Diagram', 'Create C4 Level 1 diagram showing system boundaries and external actors.', '[]', 0),
('019534d0-0008-7000-8000-000000000003', '019534c0-0003-7000-8000-000000000001', 2, 'Container & Component Diagrams', 'Create C4 Level 2-3 diagrams for key system components.', '[]', 0);

-- M2 / Tech Stack Selection
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0009-7000-8000-000000000001', '019534c0-0003-7000-8000-000000000002', 0, 'Frontend Tech Stack', 'Evaluate and select frontend framework, styling, and build tools.', '["WEB","MOBILE"]', 0),
('019534d0-0009-7000-8000-000000000002', '019534c0-0003-7000-8000-000000000002', 1, 'Backend Tech Stack', 'Evaluate and select backend language, framework, and runtime.', '[]', 0),
('019534d0-0009-7000-8000-000000000003', '019534c0-0003-7000-8000-000000000002', 2, 'Database Technology Selection', 'Choose database engine(s): relational, document, graph, time-series.', '[]', 0);

-- M2 / API Design
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000a-7000-8000-000000000001', '019534c0-0003-7000-8000-000000000003', 0, 'API Standards Definition', 'Define REST/GraphQL conventions, naming, pagination, and error formats.', '[]', 0),
('019534d0-000a-7000-8000-000000000002', '019534c0-0003-7000-8000-000000000003', 1, 'API Versioning Strategy', 'Define versioning approach: URL, header, or content negotiation.', '[]', 0);

-- M2 / Integration Architecture
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000b-7000-8000-000000000001', '019534c0-0003-7000-8000-000000000004', 0, 'Third-Party Integration Map', 'List all external services, APIs, and webhooks to integrate.', '[]', 0),
('019534d0-000b-7000-8000-000000000002', '019534c0-0003-7000-8000-000000000004', 1, 'Event-Driven Architecture Design', 'Define event schemas, message brokers, and async communication patterns.', '["ENTERPRISE"]', 0);

-- M3 / Cloud Infrastructure
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000c-7000-8000-000000000001', '019534c0-0004-7000-8000-000000000001', 0, 'Cloud Account Setup', 'Create cloud accounts with proper billing, IAM, and org policies.', '[]', 0),
('019534d0-000c-7000-8000-000000000002', '019534c0-0004-7000-8000-000000000001', 1, 'Networking & VPC Setup', 'Configure VPCs, subnets, security groups, and DNS.', '[]', 0),
('019534d0-000c-7000-8000-000000000003', '019534c0-0004-7000-8000-000000000001', 2, 'IaC Setup (Terraform/Pulumi)', 'Set up Infrastructure as Code for reproducible environments.', '["ENTERPRISE"]', 0);

-- M3 / CI/CD Pipeline
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000d-7000-8000-000000000001', '019534c0-0004-7000-8000-000000000002', 0, 'CI Pipeline Configuration', 'Set up build, lint, test, and security scan steps.', '[]', 0),
('019534d0-000d-7000-8000-000000000002', '019534c0-0004-7000-8000-000000000002', 1, 'CD Pipeline Configuration', 'Set up automated deployment to staging and production.', '[]', 0);

-- M3 / Dev Environment
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000e-7000-8000-000000000001', '019534c0-0004-7000-8000-000000000003', 0, 'Docker Compose Setup', 'Create Docker Compose for local development with all services.', '[]', 0),
('019534d0-000e-7000-8000-000000000002', '019534c0-0004-7000-8000-000000000003', 1, 'Developer Tooling & Linting', 'Set up ESLint, Prettier, Husky, and editor configurations.', '[]', 0);

-- M4 / Data Model Design
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-000f-7000-8000-000000000001', '019534c0-0005-7000-8000-000000000001', 0, 'Entity Relationship Diagram', 'Design ERD with all entities, relationships, and cardinalities.', '[]', 0),
('019534d0-000f-7000-8000-000000000002', '019534c0-0005-7000-8000-000000000001', 1, 'Schema Normalization Review', 'Ensure schema follows 3NF with intentional denormalization documented.', '[]', 0),
('019534d0-000f-7000-8000-000000000003', '019534c0-0005-7000-8000-000000000001', 2, 'Index Strategy', 'Define indexes for hot-path queries and partial indexes for soft deletes.', '[]', 0);

-- M4 / Migration Strategy
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0010-7000-8000-000000000001', '019534c0-0005-7000-8000-000000000002', 0, 'Migration Tooling Setup', 'Set up migration framework with versioning and rollback support.', '[]', 0),
('019534d0-0010-7000-8000-000000000002', '019534c0-0005-7000-8000-000000000002', 1, 'Seed Data Strategy', 'Define seed data for development, testing, and staging environments.', '[]', 0);

-- M5 / Authentication
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0011-7000-8000-000000000001', '019534c0-0006-7000-8000-000000000001', 0, 'User Registration Flow', 'Implement signup with email validation and password requirements.', '[]', 0),
('019534d0-0011-7000-8000-000000000002', '019534c0-0006-7000-8000-000000000001', 1, 'Login & Session Management', 'Implement JWT/session-based auth with refresh token rotation.', '[]', 0),
('019534d0-0011-7000-8000-000000000003', '019534c0-0006-7000-8000-000000000001', 2, 'Password Reset Flow', 'Implement secure password reset via email with token expiration.', '[]', 0);

-- M5 / Authorization
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0012-7000-8000-000000000001', '019534c0-0006-7000-8000-000000000002', 0, 'RBAC Implementation', 'Implement role-based permissions for org and project levels.', '[]', 0),
('019534d0-0012-7000-8000-000000000002', '019534c0-0006-7000-8000-000000000002', 1, 'Permission Guard Middleware', 'Create middleware to enforce permissions on API endpoints.', '[]', 0);

-- M6 / Domain Services
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0013-7000-8000-000000000001', '019534c0-0007-7000-8000-000000000001', 0, 'Domain Model Implementation', 'Implement entities, value objects, and domain services.', '[]', 0),
('019534d0-0013-7000-8000-000000000002', '019534c0-0007-7000-8000-000000000001', 1, 'Business Rules & Validation', 'Implement domain-level validation and business rule enforcement.', '[]', 0);

-- M6 / API Development
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0014-7000-8000-000000000001', '019534c0-0007-7000-8000-000000000002', 0, 'CRUD Endpoints', 'Implement create, read, update, delete endpoints for core entities.', '[]', 0),
('019534d0-0014-7000-8000-000000000002', '019534c0-0007-7000-8000-000000000002', 1, 'Input Validation & Error Handling', 'Implement request validation and standardized error responses.', '[]', 0),
('019534d0-0014-7000-8000-000000000003', '019534c0-0007-7000-8000-000000000002', 2, 'Pagination & Filtering', 'Implement cursor/offset pagination and query filtering.', '[]', 0);

-- M7 / Design System
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0015-7000-8000-000000000001', '019534c0-0008-7000-8000-000000000001', 0, 'Design Tokens Definition', 'Define colors, typography, spacing, and breakpoint tokens.', '["WEB","MOBILE"]', 0),
('019534d0-0015-7000-8000-000000000002', '019534c0-0008-7000-8000-000000000001', 1, 'Core UI Components', 'Build buttons, inputs, modals, tables, and navigation components.', '["WEB","MOBILE"]', 0);

-- M7 / Page Development
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0016-7000-8000-000000000001', '019534c0-0008-7000-8000-000000000002', 0, 'Layout & Navigation', 'Implement app shell, sidebar, header, and routing.', '["WEB","MOBILE"]', 0),
('019534d0-0016-7000-8000-000000000002', '019534c0-0008-7000-8000-000000000002', 1, 'Core Feature Pages', 'Implement main application pages with responsive design.', '["WEB","MOBILE"]', 0);

-- M9 / Testing Strategy
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0017-7000-8000-000000000001', '019534c0-000a-7000-8000-000000000001', 0, 'Test Pyramid Definition', 'Define ratio of unit, integration, and E2E tests with coverage targets.', '[]', 0),
('019534d0-0017-7000-8000-000000000002', '019534c0-000a-7000-8000-000000000001', 1, 'Testing Tools Setup', 'Set up test runners, mocking libraries, and coverage reporters.', '[]', 0);

-- M9 / Unit & Integration Tests
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0018-7000-8000-000000000001', '019534c0-000a-7000-8000-000000000002', 0, 'Unit Tests for Domain Logic', 'Write unit tests for all business rules and domain services.', '[]', 0),
('019534d0-0018-7000-8000-000000000002', '019534c0-000a-7000-8000-000000000002', 1, 'Integration Tests for APIs', 'Write integration tests for API endpoints with database.', '[]', 0);

-- M10 / OWASP Review
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0019-7000-8000-000000000001', '019534c0-000b-7000-8000-000000000001', 0, 'Injection Prevention Review', 'Audit for SQL injection, XSS, command injection vulnerabilities.', '[]', 0),
('019534d0-0019-7000-8000-000000000002', '019534c0-000b-7000-8000-000000000001', 1, 'Authentication & Session Security', 'Review auth flows for broken authentication and session management.', '[]', 0);

-- M10 / Security Configuration
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001a-7000-8000-000000000001', '019534c0-000b-7000-8000-000000000003', 0, 'Secrets Management Setup', 'Configure secrets manager (Vault, GCP Secret Manager, AWS SSM).', '[]', 0),
('019534d0-001a-7000-8000-000000000002', '019534c0-000b-7000-8000-000000000003', 1, 'HTTPS & CORS Configuration', 'Enforce HTTPS, configure CORS policies, and security headers.', '[]', 0);

-- M11 / Release Strategy
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001b-7000-8000-000000000001', '019534c0-000c-7000-8000-000000000001', 0, 'Versioning Strategy', 'Define semantic versioning and changelog generation.', '[]', 0),
('019534d0-001b-7000-8000-000000000002', '019534c0-000c-7000-8000-000000000001', 1, 'Branching Strategy', 'Define Git branching model (trunk-based, GitFlow, etc.).', '[]', 0);

-- M11 / Deployment Automation
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001c-7000-8000-000000000001', '019534c0-000c-7000-8000-000000000002', 0, 'Deployment Pipeline', 'Implement automated deployment with approval gates.', '[]', 0),
('019534d0-001c-7000-8000-000000000002', '019534c0-000c-7000-8000-000000000002', 1, 'Rollback Procedures', 'Define and test rollback procedures for failed deployments.', '[]', 0);

-- M12 / Logging
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001d-7000-8000-000000000001', '019534c0-000d-7000-8000-000000000001', 0, 'Structured Logging Setup', 'Implement JSON structured logging with correlation IDs.', '[]', 0),
('019534d0-001d-7000-8000-000000000002', '019534c0-000d-7000-8000-000000000001', 1, 'Distributed Tracing', 'Set up OpenTelemetry or equivalent for request tracing.', '["ENTERPRISE"]', 0);

-- M12 / Metrics & Alerting
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001e-7000-8000-000000000001', '019534c0-000d-7000-8000-000000000002', 0, 'Application Metrics', 'Instrument key business and performance metrics.', '[]', 0),
('019534d0-001e-7000-8000-000000000002', '019534c0-000d-7000-8000-000000000002', 1, 'Alert Rules Configuration', 'Define alerting thresholds and notification channels.', '[]', 0);

-- M13 / Technical Documentation
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-001f-7000-8000-000000000001', '019534c0-000e-7000-8000-000000000001', 0, 'Architecture Decision Records', 'Document key technical decisions with context and trade-offs.', '[]', 0),
('019534d0-001f-7000-8000-000000000002', '019534c0-000e-7000-8000-000000000001', 1, 'API Documentation', 'Generate and publish API reference documentation (OpenAPI/Swagger).', '[]', 0);

-- M13 / Runbooks
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0020-7000-8000-000000000001', '019534c0-000e-7000-8000-000000000002', 0, 'Incident Response Runbook', 'Create step-by-step guides for common production incidents.', '[]', 0),
('019534d0-0020-7000-8000-000000000002', '019534c0-000e-7000-8000-000000000002', 1, 'Disaster Recovery Plan', 'Document backup, restore, and failover procedures.', '["ENTERPRISE"]', 0);

-- M13 / Onboarding
INSERT INTO template_issues (id, epic_id, sort_order, name, how_to_fill, applicability_tags, depth) VALUES
('019534d0-0021-7000-8000-000000000001', '019534c0-000e-7000-8000-000000000003', 0, 'Developer Onboarding Guide', 'Create getting-started guide with setup instructions and codebase overview.', '[]', 0),
('019534d0-0021-7000-8000-000000000002', '019534c0-000e-7000-8000-000000000003', 1, 'Project Handoff Checklist', 'Create checklist for transferring project ownership and knowledge.', '[]', 0);


-- ─── Checklist Items (sample for critical issues) ────────────────────────────

-- Checklist for LGPD/GDPR Assessment
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0001-7000-8000-000000000001', '019534d0-0001-7000-8000-000000000002', 0, 'Identify all personal data collection points', true),
('019534e0-0001-7000-8000-000000000002', '019534d0-0001-7000-8000-000000000002', 1, 'Define legal basis for each data processing activity', true),
('019534e0-0001-7000-8000-000000000003', '019534d0-0001-7000-8000-000000000002', 2, 'Document data retention periods', false),
('019534e0-0001-7000-8000-000000000004', '019534d0-0001-7000-8000-000000000002', 3, 'Plan data subject access request (DSAR) workflow', false);

-- Checklist for User Registration Flow
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0002-7000-8000-000000000001', '019534d0-0011-7000-8000-000000000001', 0, 'Email format validation (RFC 5322)', true),
('019534e0-0002-7000-8000-000000000002', '019534d0-0011-7000-8000-000000000001', 1, 'Password strength requirements enforced', true),
('019534e0-0002-7000-8000-000000000003', '019534d0-0011-7000-8000-000000000001', 2, 'Email verification flow implemented', true),
('019534e0-0002-7000-8000-000000000004', '019534d0-0011-7000-8000-000000000001', 3, 'Duplicate email check', true),
('019534e0-0002-7000-8000-000000000005', '019534d0-0011-7000-8000-000000000001', 4, 'Rate limiting on registration endpoint', false);

-- Checklist for Login & Session Management
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0003-7000-8000-000000000001', '019534d0-0011-7000-8000-000000000002', 0, 'JWT access token with short expiry (15-30min)', true),
('019534e0-0003-7000-8000-000000000002', '019534d0-0011-7000-8000-000000000002', 1, 'Refresh token rotation implemented', true),
('019534e0-0003-7000-8000-000000000003', '019534d0-0011-7000-8000-000000000002', 2, 'Token revocation on logout', true),
('019534e0-0003-7000-8000-000000000004', '019534d0-0011-7000-8000-000000000002', 3, 'Brute-force protection on login', false);

-- Checklist for Injection Prevention
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0004-7000-8000-000000000001', '019534d0-0019-7000-8000-000000000001', 0, 'Parameterized queries used (no string concatenation)', true),
('019534e0-0004-7000-8000-000000000002', '019534d0-0019-7000-8000-000000000001', 1, 'Input sanitization on all user inputs', true),
('019534e0-0004-7000-8000-000000000003', '019534d0-0019-7000-8000-000000000001', 2, 'Content Security Policy headers configured', false),
('019534e0-0004-7000-8000-000000000004', '019534d0-0019-7000-8000-000000000001', 3, 'XSS protection verified on all rendered outputs', true);

-- Checklist for Secrets Management
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0005-7000-8000-000000000001', '019534d0-001a-7000-8000-000000000001', 0, 'No secrets in source code or environment files', true),
('019534e0-0005-7000-8000-000000000002', '019534d0-001a-7000-8000-000000000001', 1, 'Secrets rotation policy defined', false),
('019534e0-0005-7000-8000-000000000003', '019534d0-001a-7000-8000-000000000001', 2, 'Access to secrets is audited', false);

-- Checklist for Deployment Pipeline
INSERT INTO template_checklist_items (id, issue_id, sort_order, label, is_critical) VALUES
('019534e0-0006-7000-8000-000000000001', '019534d0-001c-7000-8000-000000000001', 0, 'Automated tests pass before deploy', true),
('019534e0-0006-7000-8000-000000000002', '019534d0-001c-7000-8000-000000000001', 1, 'Staging environment mirrors production', false),
('019534e0-0006-7000-8000-000000000003', '019534d0-001c-7000-8000-000000000001', 2, 'Zero-downtime deployment verified', true),
('019534e0-0006-7000-8000-000000000004', '019534d0-001c-7000-8000-000000000001', 3, 'Rollback tested and documented', true);
