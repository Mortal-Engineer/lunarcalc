/*!
 * JavaScript function to calculate the geodetic distance between two points specified by latitude/longitude using the Vincenty inverse formula for ellipsoids.
 *
 * Taken from http://movable-type.co.uk/scripts/latlong-vincenty.html and optimized / cleaned up by Mathias Bynens <http://mathiasbynens.be/>
 * Based on the Vincenty direct formula by T. Vincenty, “Direct and Inverse Solutions of Geodesics on the Ellipsoid with application of nested equations”, Survey Review, vol XXII no 176, 1975 <http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf>
 *
 * @param   {Number} lat1, lon1: first point in decimal degrees
 * @param   {Number} lat2, lon2: second point in decimal degrees
 * @returns {Number} distance in metres between points
 */

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

function distVincenty(lat1, lon1, lat2, lon2) {
    var a = 6378137,
        b = 6356752.3142,
        f = 1 / 298.257223563, // WGS-84 ellipsoid params
        L = toRad((lon2-lon1)),
        x = Math.atan(1 - f),
        U1 = x * Math.tan(toRad(lat1)),
        U2 = x * Math.tan(toRad(lat2)),
        sinU1 = Math.sin(U1),
        cosU1 = Math.cos(U1),
        sinU2 = Math.sin(U2),
        cosU2 = Math.cos(U2),
        lambda = L,
        lambdaP,
        iterLimit = 100;
    do {
     var sinLambda = Math.sin(lambda),
         cosLambda = Math.cos(lambda),
         sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
     if (0 === sinSigma) {
      return 0; // co-incident points
     };
     var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
         sigma = Math.atan2(sinSigma, cosSigma),
         sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
         cosSqAlpha = 1 - sinAlpha * sinAlpha,
         cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha,
         C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
     if (isNaN(cos2SigmaM)) {
      cos2SigmaM = 0; // equatorial line: cosSqAlpha = 0 (§6)
     };
     lambdaP = lambda;
     lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
   
    if (0 === iterLimit) {
     return NaN; // formula failed to converge
    };
   
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b),
        A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
        B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
        deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
        s = b * A * (sigma - deltaSigma);
    return s.toFixed(3); // round to 1mm precision
   };

///---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function distTunnel(arc_length) {
    const r = 6356.7523142;
    const θ = arc_length/r;
    const distance_tunnel = Math.sqrt(r**2 + r**2 - (2*r*r*Math.cos(θ)));
    return distance_tunnel
}

function parallaxAngle(ra1, dec1, ra2, dec2) {
    var deltaRa = ra2-ra1;
    if (deltaRa < 0) {
        deltaRa = deltaRa * -1;
    }
    var deltaDec = dec1-dec2;
    if (deltaDec < 0) {
        deltaDec = deltaDec * -1;
    }
    var parallaxtheta = Math.sqrt(deltaRa**2 + deltaDec **2);
    return parallaxtheta
}


function e_to_m_distance (att1, att2, parallaxtheta, distance_tunnel) {
    var ANB = 360-(360-att1-att2-parallaxtheta);
    var AOB = 360 - (ANB + 90 + 90);
    var OAB = (180-AOB)/2;
    var OBA = OAB;
    var NAB = 90 - OAB
    var NBA = 90 - OBA
    var MAB = NAB + att1;
    var MBA = NBA + att2;
    var MABrad = toRad(MAB);
    var MBArad = toRad(MBA);
    var parallaxtheta_rad = toRad(parallaxtheta)
    var a_to_m_length = distance_tunnel*((Math.sin(MBArad))/(Math.sin(parallaxtheta_rad)));
    var b_to_m_length = distance_tunnel*(Math.sin(MABrad)/Math.sin(parallaxtheta_rad));
    return [a_to_m_length,b_to_m_length]
}

function distances_to_moon (lat1, long1, ra1, dec1, alt1, lat2, long2, ra2, dec2, alt2){
    var arcdistance = distVincenty(lat1, long1, lat2, long2)/1000
    var distance_tunnel = distTunnel(arcdistance)
    var parallaxtheta = parallaxAngle(ra1,dec1,ra2,dec2)
    var lengths_to_moon = e_to_m_distance (alt1, alt2, parallaxtheta, distance_tunnel)
    return lengths_to_moon
}
