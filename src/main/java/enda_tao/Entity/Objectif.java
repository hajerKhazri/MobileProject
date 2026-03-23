package enda_tao.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "objetife122025")
public class Objectif {

    @Id
    private String msisdn;

    @Column(name = "Superviseur") // correspond à la colonne dans la BDD
    private String superviseur;
    private String nom;
    private String prenom;

    @Column(name = "VOLUME_AIRTIME")
    private Integer volumeAirtime;

    @Column(name = "NOMBRE_FACTURE_TT")
    private Integer nombreFactureTt;

    @Column(name = "VOLUME_DATA_TT")
    private Integer volumeDataTt;

    @Column(name = "NOMBRE_MFI")
    private Integer nombreMfi;

    @Column(name = "NOMBRE_SONEDE")
    private Integer nombreSonede;

    @Column(name = "NOMBRE_STEG")
    private Integer nombreSteg;

    @Column(name = "NOMBRE_TOPNET")
    private Integer nombreTopnet;

    public Objectif() {
    }

    public Objectif(String msisdn, String superviseur, String nom, String prenom,
                    Integer volumeAirtime, Integer nombreFactureTt, Integer volumeDataTt,
                    Integer nombreMfi, Integer nombreSonede, Integer nombreSteg, Integer nombreTopnet) {
        this.msisdn = msisdn;
        this.superviseur = superviseur;
        this.nom = nom;
        this.prenom = prenom;
        this.volumeAirtime = volumeAirtime;
        this.nombreFactureTt = nombreFactureTt;
        this.volumeDataTt = volumeDataTt;
        this.nombreMfi = nombreMfi;
        this.nombreSonede = nombreSonede;
        this.nombreSteg = nombreSteg;
        this.nombreTopnet = nombreTopnet;
    }

    // Getters & Setters
    public String getMsisdn() { return msisdn; }
    public void setMsisdn(String msisdn) { this.msisdn = msisdn; }

    public String getSuperviseur() { return superviseur; }
    public void setSuperviseur(String superviseur) { this.superviseur = superviseur; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public Integer getVolumeAirtime() { return volumeAirtime; }
    public void setVolumeAirtime(Integer volumeAirtime) { this.volumeAirtime = volumeAirtime; }

    public Integer getNombreFactureTt() { return nombreFactureTt; }
    public void setNombreFactureTt(Integer nombreFactureTt) { this.nombreFactureTt = nombreFactureTt; }

    public Integer getVolumeDataTt() { return volumeDataTt; }
    public void setVolumeDataTt(Integer volumeDataTt) { this.volumeDataTt = volumeDataTt; }

    public Integer getNombreMfi() { return nombreMfi; }
    public void setNombreMfi(Integer nombreMfi) { this.nombreMfi = nombreMfi; }

    public Integer getNombreSonede() { return nombreSonede; }
    public void setNombreSonede(Integer nombreSonede) { this.nombreSonede = nombreSonede; }

    public Integer getNombreSteg() { return nombreSteg; }
    public void setNombreSteg(Integer nombreSteg) { this.nombreSteg = nombreSteg; }

    public Integer getNombreTopnet() { return nombreTopnet; }
    public void setNombreTopnet(Integer nombreTopnet) { this.nombreTopnet = nombreTopnet; }
}