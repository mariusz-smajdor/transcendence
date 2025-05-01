class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getById = (req, res) => {
    const body = { ...req.body, id: req.params.id };
    const user = this.userService.findOne(body);
    delete user.password;
    delete user.totp_secret;
    if (!user) {
      return { success: false, messge: 'no user was found' };
    }

    return {
      success: true,
      data: user,
    };
  };
}

export default UserController;
