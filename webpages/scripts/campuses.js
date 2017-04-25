var campuses = loadCampuses([
//  Each campus field is delimited by one or more tabs.
//  domainName		name								incDate		idpEntityId
//  -------------	--------------------------------	----------	-----------------------------------------------------
   "calpoly			San Luis Obispo						2009-03-11",
   "calstatela		Los Angeles							2010-06-17", // had: https://idp.calstatela.edu/idp/shibboleth (test)
   "csub			Bakersfield							2010-03-29",
   "csuchico		Chico								2009-04-24",
   "csuci			Channel Islands						2009-12-17",
   "csudh			Dominguez Hills						2009-06-22",
   "csueastbay		East Bay							2010-03-23", // had: https://idp-test.csueastbay.edu/idp/shibboleth (test)
   "csufresno		Fresno								2009-07-09",
   "csulb			Long Beach							2010-03-29", //	had: https://its-shib.its.csulb.edu/idp/shibboleth (prod)
   "csum			Maritime							2009-12-03",
   "csumb			Monterey Bay						2009-05-08",
   "csun			Northridge							2010-01-28",
   "csupomona		Pomona								2009-04-23",
   "csus			Sacramento							2009-06-11",
   "csusb			San Bernardino						2009-06-18",
   "csusm			San Marcos							2009-12-17",
   "csustan			Stanislaus							2010-02-19",
   "fullerton		Fullerton							2009-06-09",
   "humboldt		Humboldt							2009-04-17",
   "sdsu			San Diego							2009-11-25",
   "sfsu			San Francisco						2010-01-11",
   "sjsu			San Jose							2009-07-06",
   "sonoma			Sonoma								2009-06-01",
   "calstate		Chancellor's Office					2007-10-08", // or earlier: https://lists.incommonfederation.org/wws/arc/incommon-participants/2007-10/msg00017.html
   "mlml.calstate	Moss Landing Marine Laboratories	2007-10-31"  // https://lists.incommonfederation.org/wws/arc/incommon-participants/2007-10/msg00020.html
]);

function loadCampuses(tds) {
    var campuses = [], domainNames = [];
    for (var s = 0; s < tds.length; s++) {
        var fields = tds[s].replace(/\t+/g, "\t").split("\t");
        campuses.push(new Campus(fields[0], fields[1], fields[2], fields[3]));
        domainNames.push(fields[0]);
    }
    campuses.domainNameRegExp = new RegExp(("(" + domainNames.join("|") + ").edu").replace(/\./g, "\\.")); // e.g.:  /(calpoly|calstatela|...|sonoma)\.edu/
    return campuses;
}

function Campus(domainName, name, incDate, idpEntityId) {
    this.domainName = domainName;
    this.name = name;
    this.incDate = incDate;
    this.idpEntityId = idpEntityId; // from http://wayf.calstate.edu/metadata/CSUconnect-metadata.xml
}
