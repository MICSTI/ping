module.exports = {
    log: {
        level: 'warn'
    },
    port: 4242,
    secretKey: 'i am a super secret key',
    mail: {
        from: 'sender info',
        options: {
            service: 'Gmail',
            auth: {
                user: 'username',
                pass: 'password'
            }
        }
    }
};