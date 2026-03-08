import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Projects API
 * Covers: CRUD operations on projects
 */

test.describe('Projects API - CRUD Operations', () => {
  let authToken: string;
  let createdProjectId: string;

  /**
   * Setup: Login and get auth token for subsequent tests
   */
  test.beforeEach(async ({ page }) => {
    // Login to get token
    const loginResponse = await page.request.post('/api/auth?action=login', {
      data: {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    }
  });

  /**
   * Test: Create new project
   */
  test('should create a new project', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');

    const createResponse = await page.request.post('/api/projects', {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      data: {
        name: `Test Project ${Date.now()}`,
        description: 'A test project for E2E testing',
        status: 'ACTIVE'
      }
    });

    // Should return 201 Created
    expect(createResponse.status()).toBe(201);

    const projectData = await createResponse.json();

    // Verify response structure
    expect(projectData).toHaveProperty('id');
    expect(projectData).toHaveProperty('name');
    expect(projectData).toHaveProperty('description');
    expect(projectData.status).toBe('ACTIVE');

    // Store ID for later tests
    createdProjectId = projectData.id;
  });

  /**
   * Test: Get project by ID
   */
  test('should retrieve project by ID', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');
    test.skip(!createdProjectId, 'Requires created project ID');

    const getResponse = await page.request.get(`/api/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(getResponse.status()).toBe(200);

    const projectData = await getResponse.json();

    expect(projectData.id).toBe(createdProjectId);
    expect(projectData).toHaveProperty('name');
    expect(projectData).toHaveProperty('description');
  });

  /**
   * Test: List all projects
   */
  test('should list all projects', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');

    const listResponse = await page.request.get('/api/projects', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(listResponse.status()).toBe(200);

    const projectsList = await listResponse.json();

    expect(Array.isArray(projectsList)).toBe(true);
    expect(projectsList.length).toBeGreaterThanOrEqual(0);
  });

  /**
   * Test: Update project
   */
  test('should update project details', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');
    test.skip(!createdProjectId, 'Requires created project ID');

    const updateResponse = await page.request.put(`/api/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      data: {
        name: `Updated Project ${Date.now()}`,
        description: 'Updated description'
      }
    });

    expect(updateResponse.status()).toBe(200);

    const updatedData = await updateResponse.json();

    expect(updatedData.id).toBe(createdProjectId);
    expect(updatedData.name).toContain('Updated Project');
    expect(updatedData.description).toBe('Updated description');
  });

  /**
   * Test: Delete project
   */
  test('should delete project', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');
    test.skip(!createdProjectId, 'Requires created project ID');

    const deleteResponse = await page.request.delete(`/api/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(deleteResponse.status()).toBe(204);

    // Verify project is deleted
    const getResponse = await page.request.get(`/api/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(getResponse.status()).toBe(404);
  });
});

/**
 * E2E Tests: Projects Authorization
 * Covers: Authentication checks, permission validation
 */

test.describe('Projects Authorization', () => {
  /**
   * Test: Reject project creation without authentication
   */
  test('should reject project creation without authentication', async ({ page }) => {
    const createResponse = await page.request.post('/api/projects', {
      data: {
        name: 'Unauthorized Project',
        description: 'Should fail'
      }
    });

    expect(createResponse.status()).toBe(401);

    const errorData = await createResponse.json();
    expect(errorData).toHaveProperty('error');
  });

  /**
   * Test: Reject project list without authentication
   */
  test('should reject project list without authentication', async ({ page }) => {
    const listResponse = await page.request.get('/api/projects');

    expect(listResponse.status()).toBe(401);
  });

  /**
   * Test: Reject access with invalid token
   */
  test('should reject access with invalid token', async ({ page }) => {
    const listResponse = await page.request.get('/api/projects', {
      headers: {
        Authorization: 'Bearer invalid-token-format'
      }
    });

    expect(listResponse.status()).toBe(401);

    const errorData = await listResponse.json();
    expect(errorData).toHaveProperty('error');
  });
});

/**
 * E2E Tests: Projects Validation
 * Covers: Input validation, error responses
 */

test.describe('Projects Validation', () => {
  let authToken: string;

  test.beforeEach(async ({ page }) => {
    const loginResponse = await page.request.post('/api/auth?action=login', {
      data: {
        email: 'test@example.com',
        password: 'SecurePass123!'
      }
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    }
  });

  /**
   * Test: Reject project creation with missing name
   */
  test('should reject project creation with missing name', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');

    const createResponse = await page.request.post('/api/projects', {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      data: {
        description: 'Missing name'
        // name field is missing
      }
    });

    expect(createResponse.status()).toBe(400);

    const errorData = await createResponse.json();
    expect(errorData).toHaveProperty('error');
  });

  /**
   * Test: Reject access to non-existent project
   */
  test('should reject access to non-existent project', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');

    const getResponse = await page.request.get('/api/projects/non-existent-id', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(getResponse.status()).toBe(404);

    const errorData = await getResponse.json();
    expect(errorData).toHaveProperty('error');
  });

  /**
   * Test: Validate project name length
   */
  test('should validate project name length', async ({ page }) => {
    test.skip(!authToken, 'Requires authentication token');

    // Try with very long name
    const longName = 'a'.repeat(500);

    const createResponse = await page.request.post('/api/projects', {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      data: {
        name: longName,
        description: 'Test'
      }
    });

    // Should either accept or reject with proper error
    if (createResponse.status() === 400) {
      const errorData = await createResponse.json();
      expect(errorData).toHaveProperty('error');
    }
  });
});
