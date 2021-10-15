
// Helper for determining if someone is signed in
export const isSignedIn = (req) => {
  return (req.session !== null && req.session !== undefined && req.session.user !== null && req.session.user !== undefined);
};

// Helper for determining if someone is an admin or not
export const isAdmin = (req) => {
  return isSignedIn(req) && req.session.user.is_admin === true;
};

// Helper middleware to determine if someone is currently signed in
export const isSignedInMiddleware = (req, res, next) => {
  if (isSignedIn(req)) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

// Helper middleware to determine if someone is an admin
export const isAdminMiddleware = (req, res, next) => {
  if (isAdmin(req)) {
    next(); //If session exists, proceed to page
  } else {
    res.redirect('/users/login');
  }
}

