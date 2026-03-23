package enda_tao.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_122025")
public class Transfer {

    @Id
    private String id;

    private String msisdn;
    private String nom;
    private String prenom;

    private Integer NOMBRE_MFI;
    private Integer VOLUME_AIRTIME;
    private Integer VOLUME_DATA_TT;
    private Integer NOMBRE_TOPNET;
    private Integer NOMBRE_FACTURE_TT;
    private Integer NOMBRE_STEG;
    private Integer NOMBRE_SONEDE;

    private LocalDateTime created_at;

    public Transfer() {
    }

    public Transfer(String id, String msisdn, String nom, String prenom,
                    Integer NOMBRE_MFI, Integer VOLUME_AIRTIME, Integer VOLUME_DATA_TT,
                    Integer NOMBRE_TOPNET, Integer NOMBRE_FACTURE_TT, Integer NOMBRE_STEG,
                    Integer NOMBRE_SONEDE, LocalDateTime created_at) {
        this.id = id;
        this.msisdn = msisdn;
        this.nom = nom;
        this.prenom = prenom;
        this.NOMBRE_MFI = NOMBRE_MFI;
        this.VOLUME_AIRTIME = VOLUME_AIRTIME;
        this.VOLUME_DATA_TT = VOLUME_DATA_TT;
        this.NOMBRE_TOPNET = NOMBRE_TOPNET;
        this.NOMBRE_FACTURE_TT = NOMBRE_FACTURE_TT;
        this.NOMBRE_STEG = NOMBRE_STEG;
        this.NOMBRE_SONEDE = NOMBRE_SONEDE;
        this.created_at = created_at;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMsisdn() {
        return msisdn;
    }

    public void setMsisdn(String msisdn) {
        this.msisdn = msisdn;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public Integer getNOMBRE_MFI() {
        return NOMBRE_MFI;
    }

    public void setNOMBRE_MFI(Integer NOMBRE_MFI) {
        this.NOMBRE_MFI = NOMBRE_MFI;
    }

    public Integer getVOLUME_AIRTIME() {
        return VOLUME_AIRTIME;
    }

    public void setVOLUME_AIRTIME(Integer VOLUME_AIRTIME) {
        this.VOLUME_AIRTIME = VOLUME_AIRTIME;
    }

    public Integer getVOLUME_DATA_TT() {
        return VOLUME_DATA_TT;
    }

    public void setVOLUME_DATA_TT(Integer VOLUME_DATA_TT) {
        this.VOLUME_DATA_TT = VOLUME_DATA_TT;
    }

    public Integer getNOMBRE_TOPNET() {
        return NOMBRE_TOPNET;
    }

    public void setNOMBRE_TOPNET(Integer NOMBRE_TOPNET) {
        this.NOMBRE_TOPNET = NOMBRE_TOPNET;
    }

    public Integer getNOMBRE_FACTURE_TT() {
        return NOMBRE_FACTURE_TT;
    }

    public void setNOMBRE_FACTURE_TT(Integer NOMBRE_FACTURE_TT) {
        this.NOMBRE_FACTURE_TT = NOMBRE_FACTURE_TT;
    }

    public Integer getNOMBRE_STEG() {
        return NOMBRE_STEG;
    }

    public void setNOMBRE_STEG(Integer NOMBRE_STEG) {
        this.NOMBRE_STEG = NOMBRE_STEG;
    }

    public Integer getNOMBRE_SONEDE() {
        return NOMBRE_SONEDE;
    }

    public void setNOMBRE_SONEDE(Integer NOMBRE_SONEDE) {
        this.NOMBRE_SONEDE = NOMBRE_SONEDE;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}