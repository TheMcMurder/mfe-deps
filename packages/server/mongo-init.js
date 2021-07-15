db.createUser({
  user: "mfe-deps-user",
  pwd: "mfe-deps-password",
  roles: [
    {
      role: "readWrite",
      db: "dependencies",
    },
  ],
});
