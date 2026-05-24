Feature: User lifecycle as an admin

  Scenario: Admin creates, promotes, and deletes a user
    When the admin creates a new user "Charlie" with email "charlie@example.com" and password "pass123"
    Then the response status is 201
    When the admin promotes Charlie to ADMIN
    Then the response status is 200
    When the admin deletes Charlie
    Then the response status is 204
