// Replaces the real Cloudinary SDK with a fake that resolves instantly.
// Backend tests should never depend on a real third-party service being
// reachable, having valid credentials, or costing API quota.
module.exports = jest.fn(() => ({
  uploader: {
    upload_stream: (options, callback) => ({
      end: () => callback(null, { secure_url: "https://fake.cloudinary.test/image.jpg", public_id: "fake_public_id" }),
    }),
    destroy: jest.fn().mockResolvedValue({ result: "ok" }),
  },
}));
