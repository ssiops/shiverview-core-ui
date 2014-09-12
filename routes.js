module.exports = [
  {
    url: '/routes',
    method: 'get',
    handler: function (req, res, srv) {
      if (typeof srv.manager.apps['shiverview-core-users'] === 'undefined' || typeof req.session.user === 'undefined') {
        res.send(srv.cache.get());
      } else if (req.session.user.admin) {
        res.send(srv.cache.get('admin'));
      } else {
        res.send(srv.cache.get('users'));
      }
    }
  }
]
