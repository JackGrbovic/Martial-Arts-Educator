using System.Security.Cryptography;

public class Hasher{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100000;
    private readonly HashAlgorithmName AlgorithmName = HashAlgorithmName.SHA512;

    public string Hash(string data)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(data, salt, Iterations, AlgorithmName, HashSize);

        return $"{Convert.ToHexString(hash)}-{Convert.ToHexString(salt)}";
    }


    public bool Verify(string credential, string credentialHash)
    {
        string[] parts = credentialHash.Split('-');
        byte[] hash = Convert.FromHexString(parts[0]);
        byte[] salt = Convert.FromHexString(parts[1]);

        byte[] inputHash = Rfc2898DeriveBytes.Pbkdf2(credential, salt, Iterations, AlgorithmName, HashSize);

        return CryptographicOperations.FixedTimeEquals(hash, inputHash);
    }
    //carry on vid from 11:40 to implement the verification method
    //could also be worth looking at splitting up the controller like he's done, or at least in a similar way
}
