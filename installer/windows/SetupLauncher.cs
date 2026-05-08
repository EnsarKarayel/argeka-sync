using System;
using System.Diagnostics;
using System.IO;
using System.Text;

public static class SetupLauncher
{
    private const string BootstrapUrl = "https://raw.githubusercontent.com/EnsarKarayel/argeka-sync/main/bootstrap.ps1";

    public static int Main(string[] args)
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.Title = "ARGEKA Sync Setup";

        string lang = SelectLanguage(args);
        WriteHeader(lang);

        string scriptPath = Path.Combine(Path.GetTempPath(), "argeka-sync-bootstrap.ps1");
        string runnerPath = Path.Combine(Path.GetTempPath(), "argeka-sync-runner.ps1");
        string runner = string.Join(Environment.NewLine, new[]
        {
            "$ErrorActionPreference = 'Stop'",
            "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12",
            "$url = '" + BootstrapUrl + "'",
            "$script = '" + scriptPath.Replace("'", "''") + "'",
            "Write-Host ''",
            "Write-Host 'Downloading ARGEKA Sync setup files...'",
            "if (Get-Command curl.exe -ErrorAction SilentlyContinue) {",
            "  & curl.exe -L --fail -o $script $url",
            "  if ($LASTEXITCODE -ne 0) { throw 'curl download failed' }",
            "} else {",
            "  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $script",
            "}",
            "& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Lang " + lang,
            "exit $LASTEXITCODE"
        });

        File.WriteAllText(runnerPath, runner, new UTF8Encoding(false));

        var process = new Process();
        process.StartInfo.FileName = "powershell.exe";
        process.StartInfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + runnerPath + "\"";
        process.StartInfo.UseShellExecute = false;
        process.Start();
        process.WaitForExit();

        Console.WriteLine();
        if (lang == "en")
        {
            Console.WriteLine("Setup finished. If the browser did not open, go to http://localhost:8080");
            Console.WriteLine("Press Enter to close this window.");
        }
        else
        {
            Console.WriteLine("Kurulum tamamlandi. Tarayici acilmadiysa http://localhost:8080 adresine girin.");
            Console.WriteLine("Bu pencereyi kapatmak icin Enter'a basin.");
        }

        Console.ReadLine();
        return process.ExitCode;
    }

    private static string SelectLanguage(string[] args)
    {
        foreach (string arg in args)
        {
            string value = arg.Trim().ToLowerInvariant();
            if (value == "en" || value == "/lang=en" || value == "-lang=en") return "en";
            if (value == "tr" || value == "/lang=tr" || value == "-lang=tr") return "tr";
        }

        Console.WriteLine("ARGEKA Sync Setup");
        Console.WriteLine();
        Console.WriteLine("Dil secin / Choose language");
        Console.WriteLine("1 - Turkce");
        Console.WriteLine("2 - English");
        Console.Write("Secim / Choice [1]: ");

        string choice = Console.ReadLine();
        return choice != null && choice.Trim() == "2" ? "en" : "tr";
    }

    private static void WriteHeader(string lang)
    {
        Console.WriteLine();
        if (lang == "en")
        {
            Console.WriteLine("ARGEKA Sync will be installed on this computer.");
            Console.WriteLine("The setup may install/check Git, Docker Desktop and WSL.");
            Console.WriteLine("Your data will stay on this computer/server.");
        }
        else
        {
            Console.WriteLine("ARGEKA Sync bu bilgisayara kurulacak.");
            Console.WriteLine("Kurulum Git, Docker Desktop ve WSL kontrollerini yapabilir.");
            Console.WriteLine("Verileriniz bu bilgisayarda/sunucuda kalir.");
        }
    }
}
