package enda_tao.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "localisation_ap")
public class LocalisationAp {

    
    @Column(name = "Status Agent")
    private String statusAgent;

    @Id
    @Column(name = "msisdn")
    private String msisdn;

    @Column(name = "agent")
    private String agent;

    @Column(name = "superviseur")
    private String superviseur;

    @Column(name = "Activité")
    private String activite;

    @Column(name = "Localisation Fiabilisé")
    private String localisationFiabilise;

    @Column(name = "gouvernerat")
    private String gouvernerat;

    @Column(name = "Délegation")
    private String delegation;

    @Column(name = "Localité")
    private String localite;

    @Column(name = "Région")
    private String region;

    @Column(name = "Date d'activation commercial")
    private String dateActivationCommercial; 

    @Column(name = "Date de création")
    private String dateCreation;  

    @Column(name = "adresse")
    private String adresse;

    @Transient 
    private Double latitude;

    @Transient 
    private Double longitude;

    
   

    public String getStatusAgent() { return statusAgent; }
    public void setStatusAgent(String statusAgent) { this.statusAgent = statusAgent; }

    public String getMsisdn() { return msisdn; }
    public void setMsisdn(String msisdn) { this.msisdn = msisdn; }

    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }

    public String getSuperviseur() { return superviseur; }
    public void setSuperviseur(String superviseur) { this.superviseur = superviseur; }

    public String getActivite() { return activite; }
    public void setActivite(String activite) { this.activite = activite; }

    public String getLocalisationFiabilise() { return localisationFiabilise; }
    public void setLocalisationFiabilise(String localisationFiabilise) { this.localisationFiabilise = localisationFiabilise; }

    public String getGouvernerat() { return gouvernerat; }
    public void setGouvernerat(String gouvernerat) { this.gouvernerat = gouvernerat; }

    public String getDelegation() { return delegation; }
    public void setDelegation(String delegation) { this.delegation = delegation; }

    public String getLocalite() { return localite; }
    public void setLocalite(String localite) { this.localite = localite; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getDateActivationCommercial() { return dateActivationCommercial; }
    public void setDateActivationCommercial(String dateActivationCommercial) { this.dateActivationCommercial = dateActivationCommercial; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}