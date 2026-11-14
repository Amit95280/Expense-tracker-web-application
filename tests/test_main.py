def register_and_login(
    client,
    email="test@example.com",
):
    register_response = client.post(
        "/register",
        json={
            "name": "Test User",
            "email": email,
            "password": "123456",
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/login",
        data={
            "username": email,
            "password": "123456",
        },
    )

    assert login_response.status_code == 200

    return login_response.json()["access_token"]


def test_home(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Expense API is running"


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register(client):
    response = client.post(
        "/register",
        json={
            "name": "Amit",
            "email": "amit@example.com",
            "password": "123456",
        },
    )

    assert response.status_code == 201
    assert response.json()["message"] == "User registered successfully"
    assert "user_id" in response.json()


def test_duplicate_register(client):
    payload = {
        "name": "Amit",
        "email": "duplicate@example.com",
        "password": "123456",
    }

    first = client.post("/register", json=payload)
    second = client.post("/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 400


def test_invalid_register(client):
    response = client.post(
        "/register",
        json={"name": "Amit"},
    )

    assert response.status_code == 422


def test_login(client):
    token = register_and_login(client)

    assert token


def test_invalid_login(client):
    client.post(
        "/register",
        json={
            "name": "Amit",
            "email": "wrongpass@example.com",
            "password": "123456",
        },
    )

    response = client.post(
        "/login",
        data={
            "username": "wrongpass@example.com",
            "password": "wrong",
        },
    )

    assert response.status_code == 401


def test_profile_without_token(client):
    response = client.get("/profile")

    assert response.status_code == 401


def test_profile_with_token(client):
    token = register_and_login(
        client,
        "profile@example.com",
    )

    response = client.get(
        "/profile",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == "profile@example.com"


def test_expense_crud(client):
    token = register_and_login(
        client,
        "expense@example.com",
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    create_response = client.post(
        "/expenses",
        headers=headers,
        json={
            "title": "Lunch",
            "amount": 150,
            "category": "Food",
        },
    )

    assert create_response.status_code == 201

    expense = create_response.json()
    expense_id = expense["id"]

    get_response = client.get(
        f"/expenses/{expense_id}",
        headers=headers,
    )

    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Lunch"

    update_response = client.put(
        f"/expenses/{expense_id}",
        headers=headers,
        json={
            "title": "Dinner",
            "amount": 250,
            "category": "Food",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Dinner"

    list_response = client.get(
        "/expenses",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    delete_response = client.delete(
        f"/expenses/{expense_id}",
        headers=headers,
    )

    assert delete_response.status_code == 200

    missing_response = client.get(
        f"/expenses/{expense_id}",
        headers=headers,
    )

    assert missing_response.status_code == 404


def test_filter_search_and_pagination(client):
    token = register_and_login(
        client,
        "filter@example.com",
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    client.post(
        "/expenses",
        headers=headers,
        json={
            "title": "Pizza",
            "amount": 300,
            "category": "Food",
        },
    )

    client.post(
        "/expenses",
        headers=headers,
        json={
            "title": "Bus",
            "amount": 50,
            "category": "Travel",
        },
    )

    # Category filter
    filtered = client.get(
        "/expenses?category=Food",
        headers=headers,
    )

    assert filtered.status_code == 200
    assert len(filtered.json()) == 1
    assert filtered.json()[0]["title"] == "Pizza"

    # Search
    searched = client.get(
        "/expenses?search=Pizza",
        headers=headers,
    )

    assert searched.status_code == 200
    assert len(searched.json()) == 1
    assert searched.json()[0]["title"] == "Pizza"

    # Pagination
    paged = client.get(
        "/expenses?page=1&limit=1",
        headers=headers,
    )

    assert paged.status_code == 200
    assert len(paged.json()) == 1