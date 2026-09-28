import { userRepository } from '../repositories/user.repository.js';

export const settingsService = {
  get: (user) => ({ dark_mode: user.dark_mode }),

  async update(userId, { dark_mode: darkMode }) {
    const user = await userRepository.updateDarkMode(userId, darkMode);
    return { dark_mode: user.dark_mode };
  },
};
