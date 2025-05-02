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

  getAll = (req, res) => {
    const users = this.userService.findAll();
    res.status(200).send({
      success: true,
      data: users,
    });
  };

  updateById = (req, res) => {
    const isUpdated = this.userService.updateOne(
      { id: req.params.id },
      req.body,
    );
    if (!isUpdated) {
      return { success: false, message: "couldn't update the user" };
    }
    return { success: true, message: 'user was successfully updated' };
  };

  deleteById = (req, res) => {
    const isDeleted = this.userService.deleteOne({ id: req.params.id });

    if (!isDeleted) {
      return { success: false, message: 'user was not deleted' };
    }
    return { success: true, message: 'user was successfully deleted' };
  };
}

export default UserController;
