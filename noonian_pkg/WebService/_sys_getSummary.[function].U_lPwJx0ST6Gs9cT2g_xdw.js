function (db, Q, _) {
    const moment = require('moment');
    
    return Q.all([
        db.User.find({},{name:1,roles:1,last_login:1}).lean().exec(),
        db.BusinessObjectPackage.find({}).lean().exec()
    ])
    .then(function([userList, bopList]) {
        const roleCounts = {};
        const userSummary = {users_per_role:roleCounts};
        
        var latestAccessTime = moment('1960-01-01');
        var lastAccessUser = null;
        
        for(var u of userList) {
            for(var roleRef of u.roles) {
                let r = roleRef._disp;
                roleCounts[r] ? roleCounts[r]++ : roleCounts[r] = 1;
            }
            if(u.last_login) {
                let lastLogin = moment(u.last_login);
                if(lastLogin.isAfter(latestAccessTime)) {
                    latestAccessTime = lastLogin;
                    userSummary.last_access_user = u.name;
                }
            }
            
        }
        
        const packageSummary = {};
        for(var p of bopList) {
            packageSummary[p.key] = (p.major_version||0)+'.'+(p.minor_version||0);
        }
        
        return {
            user_summary:userSummary,
            package_summary:packageSummary
        }
    });
}