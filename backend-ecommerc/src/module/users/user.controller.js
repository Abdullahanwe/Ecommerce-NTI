import * as userService from './user.service.js'
import { auth, authentication, authorization } from '../../middleware/authentication.middleware.js';
import { endPoint } from './authorization.user.js';
import { Router } from "express";
import { tokenTypeEnum } from '../../utils/security/token.security.js';
import { validation } from '../../middleware/validation.middlware.js'
import * as validators from './user.validation.js'

const router = Router();



router.get('/',
    auth({ accessRole: endPoint.profile }),
    userService.profile)

router.get('/:userId/profile',
    validation(validators.shareProfile)
    , userService.shareProfile)

router.patch('/',
    authentication(),
    validation(validators.updateBasicProfile)
    , userService.updateBasicProfile)


router.delete('{/:userId}/freeze',
    authentication(),
    validation(validators.freezeAccount)
    , userService.freezeAccount)


router.patch('{/:userId}/restore',
    authentication(),
    validation(validators.restoreAccount)
    , userService.restoreAccount)


router.delete('{/:userId}/hard',
    authentication(),
    validation(validators.freezeAccount)
    , userService.hardDelete)

router.patch("/update-password",
    authentication(),
    validation(validators.updatePassword),
    userService.updatePassword
)
router.get('/refresh-token',
    authentication({ tokenType: tokenTypeEnum.refresh }),
    userService.getNewToken)

export default router;