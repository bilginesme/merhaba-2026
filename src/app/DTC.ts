export const supportedLanguages = ['en', 'es', 'fr', 'tr']; // <--- Add your supported langs here

export class DTC {
  public strFontFamily:string = 'Playpen Sans';

  public truncateString(str: string, nChars: number): string {
    var result = "";
    var suffix = "...";

    if (str.length <= nChars) {
      result = str;
    } else {
      var strTruncated = str.substring(0, nChars - suffix.length);
      result = strTruncated + suffix;
    }

    return result;
  }

  public doubleDigit(n: number): string {
    var strResult = "";

    if (n < 100 && n > 0) {
      if (n < 10) strResult = "0" + n;
      else strResult = n.toString();
    }

    return strResult;
  }

  public tripleDigit(n: number): string {
    var strResult = "";

    if (n > 0 && n < 1000) {
      if (n < 10) strResult = "00" + n;
      else if (n < 100) strResult = "0" + n;
      else strResult = n.toString();
    }

    return strResult;
  }

  public getSupportedLanguageCodes(): string[] {
    const supportedLanguages = ['da', 'de', 'el', 'en', 'es', 'fr', 'it', 'nl', 'no', 'pt', 'sv', 'tr'];

    return supportedLanguages;
  }

  public getSupportedLanguageNames(): Map<string, string> {
    let map = new Map();
    
    map.set('da', 'Dansk');
    map.set('de', 'Deutsch');
    map.set('el', 'Ελληνικά');
    map.set('en', 'English');
    map.set('es', 'Español');
    map.set('fr', 'Français');
    map.set('it', 'Italiano');  
    map.set('nl', 'Nederlands');
    map.set('no', 'Norsk');
    map.set('pt', 'Português');
    map.set('sv', 'Svenska');
    map.set('tr', 'Türkçe');  

    return map;
  }

}
