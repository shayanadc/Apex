Feature: A user managing themselves

  Scenario: User logs in, reads and updates own profile
    When the admin creates a new user "Dave" with email "dave@example.com" and password "pass123"
    Then the response status is 201
    When Dave reads his own profile
    Then the response status is 200
    When Dave updates his own name to "David"
    Then the response status is 200
