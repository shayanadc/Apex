Feature: Authorization boundaries surface correctly over HTTP

  Scenario: A user cannot read another user's profile
    When the admin creates a new user "Eve" with email "eve@example.com" and password "pass123"
    Then the response status is 201
    When the admin creates a new user "Frank" with email "frank@example.com" and password "pass123"
    Then the response status is 201
    When Eve tries to read Frank's profile
    Then the response status is 403

  Scenario: Nobody can delete themselves
    When the admin tries to delete themselves
    Then the response status is 403

  Scenario: Admin gets 404 for non-existent user
    When the admin requests GET "/api/users/9999"
    Then the response status is 404
