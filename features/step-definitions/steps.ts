import { When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { AppWorld } from '../support/world.js';

const BASE_URL = `http://localhost:${process.env.PORT || 3099}`;

function adminHeaders(world: AppWorld): Record<string, string> {
  return { Authorization: `Bearer ${world.adminToken}`, 'Content-Type': 'application/json' };
}

// ── Shared assertion ──────────────────────────────────────────────────────────

Then<AppWorld>('the response status is {int}', function (expectedStatus: number) {
  assert.ok(this.lastResponse, 'No response received');
  assert.equal(this.lastResponse.status, expectedStatus);
});

// ── Admin lifecycle ───────────────────────────────────────────────────────────

When<AppWorld>(
  'the admin creates a new user {string} with email {string} and password {string}',
  async function (name: string, email: string, password: string) {
    this.lastResponse = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: adminHeaders(this),
      body: JSON.stringify({ name, email, password, role: 'USER' }),
    });

    if (this.lastResponse.ok) {
      const body = await this.lastResponse.clone().json();
      this.lastCreatedUserId = body.data.id;
      this.lastCreatedUserToken = body.data.access_token;
      this.users.set(name, { id: body.data.id, plainToken: body.data.access_token });
    }
  },
);

When<AppWorld>('the admin promotes Charlie to ADMIN', async function () {
  const charlie = this.users.get('Charlie');
  assert.ok(charlie, 'Charlie was not created');
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${charlie.id}`, {
    method: 'PATCH',
    headers: adminHeaders(this),
    body: JSON.stringify({ role: 'ADMIN' }),
  });
});

When<AppWorld>('the admin deletes Charlie', async function () {
  const charlie = this.users.get('Charlie');
  assert.ok(charlie, 'Charlie was not created');
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${charlie.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${this.adminToken}` },
  });
});

// ── User self-management ──────────────────────────────────────────────────────

When<AppWorld>('Dave reads his own profile', async function () {
  const dave = this.users.get('Dave');
  assert.ok(dave, 'Dave was not created');
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${dave.id}`, {
    headers: { Authorization: `Bearer ${dave.plainToken}` },
  });
});

When<AppWorld>('Dave updates his own name to {string}', async function (newName: string) {
  const dave = this.users.get('Dave');
  assert.ok(dave, 'Dave was not created');
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${dave.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dave.plainToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  });
});

// ── Authorization boundaries ──────────────────────────────────────────────────

When<AppWorld>("Eve tries to read Frank's profile", async function () {
  const eve = this.users.get('Eve');
  const frank = this.users.get('Frank');
  assert.ok(eve, 'Eve was not created');
  assert.ok(frank, 'Frank was not created');
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${frank.id}`, {
    headers: { Authorization: `Bearer ${eve.plainToken}` },
  });
});

When<AppWorld>('the admin tries to delete themselves', async function () {
  this.lastResponse = await fetch(`${BASE_URL}/api/users/${this.adminId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${this.adminToken}` },
  });
});

When<AppWorld>('the admin requests GET {string}', async function (path: string) {
  this.lastResponse = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${this.adminToken}` },
  });
});
