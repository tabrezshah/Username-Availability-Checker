async function checkUsername() {
    const username = document.getElementById("username").value.trim();
    const outputBox = document.getElementById("output-box");
  
    // Check if the username is empty
    if (username === "") {
      outputBox.innerHTML = `<p style="color: red;">Please enter a username!</p>`;
      return;
    }
  
    outputBox.innerHTML = `<p>Checking username: <span>${username}</span></p><p>Loading...</p>`;
  
    // List of open APIs to check usernames
    const apis = [
      {
        name: "GitHub",
        url: `https://api.github.com/users/${username}`,
        exists: (response) => response.ok
      },
      {
        name: "Dev.to",
        url: `https://dev.to/${username}`,
        exists: (response) => response.ok
      },
      {
        name: "GitLab",
        url: `https://gitlab.com/api/v4/users?username=${username}`,
        exists: (response) => response.ok && response.json().then(data => data.length > 0)
      },
      {
        name: "Codewars",
        url: `https://www.codewars.com/api/v1/users/${username}`,
        exists: (response) => response.ok
      },
      {
        name: "StackOverflow",
        url: `https://api.stackexchange.com/2.3/users?order=desc&sort=reputation&inname=${username}&site=stackoverflow`,
        exists: async (response) => {
          if (response.ok) {
            const data = await response.json();
            return data.items && data.items.length > 0;
          }
          return false;
        }
      }
    ];
  
    // Check each API and build the result
    const results = await Promise.all(
      apis.map(async (api) => {
        try {
          const response = await fetch(api.url);
          const userExists = await api.exists(response);
          return {
            platform: api.name,
            exists: userExists
          };
        } catch (error) {
          return {
            platform: api.name,
            exists: false,
            error: "API Error"
          };
        }
      })
    );
  
    // Clear the output box and display new results
    outputBox.innerHTML = ''; // Clear previous content
    
    // Display results
    results.forEach(({ platform, exists, error }) => {
      let resultHTML = '';
  
      if (error) {
        resultHTML = `<p class="warning">⚠️ ${platform}: Unable to check (Error: ${error})</p>`;
      } else if (exists) {
        resultHTML = `<p class="success">✔ Username exists on ${platform}</p>`;
      } else {
        resultHTML = `<p class="failure">✘ Username not found on ${platform}</p>`;
      }
  
      outputBox.innerHTML += resultHTML; // Append each result
    });
  }
  
  // Attach the function to the button click
  document.getElementById("submit-btn").addEventListener("click", checkUsername);
  