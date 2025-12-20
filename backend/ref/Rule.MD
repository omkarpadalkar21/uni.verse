### ✅ Add @OneToMany in User when:

You need to navigate from User → Tokens in code

You want to cascade delete (delete user → delete all tokens)

You query "get all X for this user" frequently

### ❌ DON'T Add when:

You only query by token value (e.g., "find user by refresh token")

Tokens are short-lived and rarely accessed from user side

You want to keep User entity lightweight

### For Your Auth Tokens: DON'T Add to User ✅

Here's why:

### 1. EmailVerificationToken

#### ❌ DON'T add this to User

@OneToMany(mappedBy = "user")
private List<EmailVerificationToken> emailVerificationTokens;
Why not?

You never query "show me all verification tokens for this user"

You always query "find token by OTP" or "find latest token for user"

Tokens expire in 10 minutes - no value in navigating from user

Clutters User entity

How you'll actually use it:

### ✅ Query by OTP, not by user

EmailVerificationToken token = tokenRepository.findByOtpAndUserId(otp, userId);

### ✅ Or get latest for user

EmailVerificationToken latest = tokenRepository
.findTopByUserIdOrderByCreatedAtDesc(userId);